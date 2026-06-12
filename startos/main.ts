import { manifest as bitcoinManifest } from 'bitcoin-core-startos/startos/manifest'
import { storeJson } from './fileModels/storeJson'
import { translatorToml } from './fileModels/translatorToml'
import { jdcToml } from './fileModels/jdcToml'
import { generateTranslatorToml } from './translatorConfig'
import { generateJdcSoloToml } from './jdcConfig'
import { sdk } from './sdk'
import {
  ipcSocketMountpoint,
  jdcAuthorityPublicKey,
  jdcPort,
  stratumPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting Stratum V2!')

  const store = await storeJson.read().const(effects)
  if (!store?.mode || !store.username) {
    throw new Error('Stratum V2 is not configured — run the Configure action.')
  }

  const tuning = {
    username: store.username,
    minHashrateThs: store.minHashrateThs,
    sharesPerMinute: store.sharesPerMinute,
    extranonce2Size: store.extranonce2Size,
    aggregateChannels: store.aggregateChannels,
  }

  if (store.mode === 'pool') {
    if (!store.poolAddress || !store.poolPort || !store.poolAuthorityPubkey) {
      throw new Error('Pool mode requires pool address, port, and authority key.')
    }
    await translatorToml.write(
      effects,
      generateTranslatorToml(tuning, {
        address: store.poolAddress,
        port: store.poolPort,
        authorityPubkey: store.poolAuthorityPubkey,
      }),
    )

    const sub = await sdk.SubContainer.of(
      effects,
      { imageId: 'sv2' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'translator-sub',
    )

    return sdk.Daemons.of(effects).addDaemon('translator', {
      subcontainer: sub,
      exec: { command: ['/app/translator_sv2', '-c', '/data/translator.toml'], cwd: '/app' },
      ready: {
        display: 'Stratum Server',
        gracePeriod: 15_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, stratumPort, {
            successMessage: 'The Stratum server is ready',
            errorMessage: 'The Stratum server is not ready',
          }),
      },
      requires: [],
    })
  }

  // Sovereign (solo) mode: JD Client + Translator share one subcontainer so the
  // translator reaches the JDC at 127.0.0.1. JDC builds templates from Bitcoin
  // Core over its IPC socket (mounted read-only from the bitcoind dependency).
  if (!store.coinbaseRewardAddress) {
    throw new Error('Sovereign mode requires a coinbase reward address.')
  }

  await sdk.checkDependencies(effects).then((r) => r.throwIfNotSatisfied())

  await jdcToml.write(
    effects,
    generateJdcSoloToml({
      username: store.username,
      sharesPerMinute: store.sharesPerMinute,
      jdcSignature: store.jdcSignature,
      coinbaseRewardAddress: store.coinbaseRewardAddress,
      network: store.bitcoinNetwork,
    }),
  )
  await translatorToml.write(
    effects,
    generateTranslatorToml(tuning, {
      address: '127.0.0.1',
      port: jdcPort,
      authorityPubkey: jdcAuthorityPublicKey,
    }),
  )

  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'sv2' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency<typeof bitcoinManifest>({
        dependencyId: 'bitcoind',
        volumeId: 'main',
        subpath: 'ipc/bitcoin-core.sock',
        mountpoint: ipcSocketMountpoint(store.bitcoinNetwork),
        readonly: true,
      }),
    'sv2-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('jdc', {
      subcontainer: sub,
      exec: { command: ['/app/jd_client_sv2', '-c', '/data/jdc.toml'], cwd: '/app' },
      ready: {
        display: 'Job Declaration Client',
        gracePeriod: 30_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, jdcPort, {
            successMessage: 'The JD Client is ready',
            errorMessage: 'The JD Client is not ready',
          }),
      },
      requires: [],
    })
    .addDaemon('translator', {
      subcontainer: sub,
      exec: { command: ['/app/translator_sv2', '-c', '/data/translator.toml'], cwd: '/app' },
      ready: {
        display: 'Stratum Server',
        gracePeriod: 15_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, stratumPort, {
            successMessage: 'The Stratum server is ready',
            errorMessage: 'The Stratum server is not ready',
          }),
      },
      requires: ['jdc'],
    })
})
