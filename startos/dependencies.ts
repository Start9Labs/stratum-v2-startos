import { ipc } from 'bitcoin-core-startos/startos/actions/ipc'
import { storeJson } from './fileModels/storeJson'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const mode = await storeJson.read((s) => s.mode).const(effects)

  // Pool mode needs no Bitcoin node. The job-declaration modes (solo / jd-pool)
  // build templates from your own node over IPC, so depend on bitcoind and
  // enforce its IPC socket on.
  if (mode !== 'solo' && mode !== 'jd-pool') return {}

  await sdk.action.createTask(effects, 'bitcoind', ipc, 'critical', {
    input: { kind: 'partial', value: { enableIpc: true } },
    when: { condition: 'input-not-matches', once: false },
    reason: 'Job-declaration mining requires Bitcoin Core IPC.',
  })

  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=31.0:0',
      healthChecks: ['bitcoind'],
    },
  }
})
