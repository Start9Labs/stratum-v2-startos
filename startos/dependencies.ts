import { ipc } from 'bitcoin-core-startos/startos/actions/ipc'
import { storeJson } from './fileModels/storeJson'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const mode = await storeJson.read((s) => s.mode).const(effects)

  if (mode !== 'solo' && mode !== 'jd-pool') return {}

  await sdk.action.createTask(effects, 'bitcoind', ipc, 'critical', {
    input: {
      kind: 'partial',
      accept: [{ enableIpc: true }],
      set: { enableIpc: true },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n(
      'Sovereign mining reads block templates from Bitcoin over its IPC socket.',
    ),
  })

  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=31.0:0',
      healthChecks: ['bitcoind'],
    },
  }
})
