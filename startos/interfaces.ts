import { i18n } from './i18n'
import { sdk } from './sdk'
import { monitoringPort, stratumPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const stratumMulti = sdk.MultiHost.of(effects, 'stratum-multi')
  const stratumOrigin = await stratumMulti.bindPort(stratumPort, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: stratumPort,
    secure: { ssl: false },
  })
  const stratum = sdk.createInterface(effects, {
    name: i18n('Stratum'),
    id: 'stratum',
    description: i18n('Point your SV1 miners here.'),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: 'stratum+tcp', noSsl: 'stratum+tcp' },
    username: null,
    path: '',
    query: {},
  })

  const monitoringMulti = sdk.MultiHost.of(effects, 'monitoring-multi')
  const monitoringOrigin = await monitoringMulti.bindPort(monitoringPort, {
    protocol: 'http',
  })
  const monitoring = sdk.createInterface(effects, {
    name: i18n('Monitoring API'),
    id: 'monitoring',
    description: i18n(
      'Read-only HTTP API exposing hashrate and share statistics.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [
    await stratumOrigin.export([stratum]),
    await monitoringOrigin.export([monitoring]),
  ]
})
