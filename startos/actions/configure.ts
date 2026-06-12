import { storeJson } from '../fileModels/storeJson'
import { sdk } from '../sdk'
import { requireConfigureReplayId } from '../init/taskRequireConfigure'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  poolAddress: Value.text({
    name: 'Pool Address',
    description: 'Hostname or IP of the Stratum V2 pool (no port).',
    required: true,
    default: null,
    placeholder: 'pool.example.com',
  }),
  poolPort: Value.number({
    name: 'Pool Port',
    description: 'Stratum V2 port of the pool.',
    required: true,
    default: 34254,
    integer: true,
    min: 1,
    max: 65535,
  }),
  poolAuthorityPubkey: Value.text({
    name: 'Pool Authority Public Key',
    description: "The pool's Stratum V2 authority public key.",
    required: true,
    default: null,
  }),
  username: Value.text({
    name: 'Username / Worker',
    description:
      'Identity sent upstream (often your payout address or pool username, e.g. address.worker).',
    required: true,
    default: null,
  }),
  minHashrateThs: Value.number({
    name: 'Starting Hashrate Estimate (TH/s)',
    description:
      'Initial per-miner hashrate hint for vardiff. Difficulty auto-adjusts from here.',
    required: true,
    default: 100,
    integer: false,
    min: 0,
  }),
  sharesPerMinute: Value.number({
    name: 'Shares Per Minute',
    description: 'Target share submission rate per miner.',
    required: true,
    default: 6,
    integer: false,
    min: 1,
  }),
  extranonce2Size: Value.number({
    name: 'Extranonce2 Size',
    description: 'Downstream extranonce2 size in bytes.',
    required: true,
    default: 4,
    integer: true,
    min: 1,
  }),
  aggregateChannels: Value.toggle({
    name: 'Aggregate Channels',
    description:
      'Share a single upstream channel across all miners. Enable for pools that require it (e.g. Braiins).',
    default: false,
  }),
})

export const configure = sdk.Action.withInput(
  'configure',

  async ({ effects }) => ({
    name: 'Configure',
    description: 'Set the Stratum V2 pool the Translator Proxy connects to.',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const s = await storeJson.read().once()
    return {
      poolAddress: s?.poolAddress ?? undefined,
      poolPort: s?.poolPort ?? undefined,
      poolAuthorityPubkey: s?.poolAuthorityPubkey ?? undefined,
      username: s?.username ?? undefined,
      minHashrateThs: s?.minHashrateThs ?? undefined,
      sharesPerMinute: s?.sharesPerMinute ?? undefined,
      extranonce2Size: s?.extranonce2Size ?? undefined,
      aggregateChannels: s?.aggregateChannels ?? undefined,
    }
  },

  async ({ effects, input }) => {
    await storeJson.merge(effects, input)
    // Auto-clear the install-time "needs configuration" task now that pool
    // details exist (own-task auto-clear is unreliable from init; see memory).
    await sdk.action.clearTask(effects, requireConfigureReplayId)
  },
)
