import { storeJson } from './fileModels/storeJson'
import { translatorToml } from './fileModels/translatorToml'
import { generateTranslatorToml } from './translatorConfig'
import { sdk } from './sdk'
import { stratumPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting Stratum V2 Translator Proxy!')

  const store = await storeJson.read().const(effects)
  if (
    !store?.poolAddress ||
    !store.poolPort ||
    !store.poolAuthorityPubkey ||
    !store.username
  ) {
    throw new Error('Stratum V2 is not configured — run the Configure action.')
  }

  await translatorToml.write(
    effects,
    generateTranslatorToml({
      poolAddress: store.poolAddress,
      poolPort: store.poolPort,
      poolAuthorityPubkey: store.poolAuthorityPubkey,
      username: store.username,
      minHashrateThs: store.minHashrateThs,
      sharesPerMinute: store.sharesPerMinute,
      extranonce2Size: store.extranonce2Size,
      aggregateChannels: store.aggregateChannels,
    }),
  )

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'translator' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'translator-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('translator', {
    subcontainer,
    exec: {
      command: ['/app/translator_sv2', '-c', '/data/translator.toml'],
      cwd: '/app',
    },
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
})
