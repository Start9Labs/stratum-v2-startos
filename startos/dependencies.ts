import { ipc } from 'bitcoin-core-startos/startos/actions/ipc'
import { stateJson } from './fileModels/stateJson'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const mode = await stateJson.read((s) => s.mode).const(effects)

  // Pool / SV1-translation mode needs no Bitcoin node. Only Job Declaration
  // mode depends on Bitcoin Core, and only then do we enforce its IPC socket.
  if (mode !== 'jd') return {}

  await sdk.action.createTask(effects, 'bitcoind', ipc, 'critical', {
    input: { kind: 'partial', value: { enableIpc: true } },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Stratum V2 Job Declaration mode requires Bitcoin Core IPC.'),
  })

  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=31.0:0',
      healthChecks: ['bitcoind'],
    },
  }
})
