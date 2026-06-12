import { stateJson } from './fileModels/stateJson'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { bitcoindIpcMountpoint, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Stratum V2 UI!'))

  const stratumHost = await sdk.serviceInterface
    .getOwn(effects, 'stratum', (i) =>
      i?.addressInfo
        ?.format('hostname-info')
        .map((h) => h.hostname)
        .find((h) => !h.endsWith('.onion')),
    )
    .const()

  const jdMode = (await stateJson.read((s) => s.mode).const(effects)) === 'jd'

  let mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })
  if (jdMode) {
    mounts = mounts.mountDependency({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: 'ipc',
      mountpoint: bitcoindIpcMountpoint,
      readonly: true,
    })
  }

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'sv2-ui' },
    mounts,
    'sv2-ui-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: {
      command: sdk.useEntrypoint(['/usr/local/bin/start.sh']),
      runAsInit: true,
      env: {
        HOST_OS: 'startos',
        ...(stratumHost ? { STRATUM_HOST: stratumHost } : {}),
      },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
