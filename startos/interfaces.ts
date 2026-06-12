import { i18n } from './i18n'
import { sdk } from './sdk'
import { stratumPort, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n('The Stratum V2 UI setup and monitoring dashboard'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const stratumMulti = sdk.MultiHost.of(effects, 'stratum-multi')
  const stratumOrigin = await stratumMulti.bindPort(stratumPort, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: stratumPort,
    secure: { ssl: false },
  })
  const stratum = sdk.createInterface(effects, {
    name: i18n('Stratum (Translator Proxy)'),
    id: 'stratum',
    description: i18n(
      'Address SV1 miners point to (stratum+tcp). Available once setup completes.',
    ),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: 'stratum+tcp', noSsl: 'stratum+tcp' },
    username: null,
    path: '',
    query: {},
  })

  return [
    await uiOrigin.export([ui]),
    await stratumOrigin.export([stratum]),
  ]
})
