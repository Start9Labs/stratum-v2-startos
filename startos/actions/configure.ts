import { storeJson } from '../fileModels/storeJson'
import { sdk } from '../sdk'
import { requireConfigureReplayId } from '../init/taskRequireConfigure'

const { InputSpec, Value, Variants } = sdk

export const inputSpec = InputSpec.of({
  connection: Value.union({
    name: 'Mining Mode',
    description:
      'Pool: translate SV1 miners to a Stratum V2 pool. Sovereign: mine solo to your own Bitcoin Core node (requires Bitcoin Core 31.x with IPC).',
    default: 'pool',
    variants: Variants.of({
      pool: {
        name: 'Pool',
        spec: InputSpec.of({
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
        }),
      },
      sovereign: {
        name: 'Sovereign (solo)',
        spec: InputSpec.of({
          bitcoinNetwork: Value.select({
            name: 'Bitcoin Network',
            description: 'Must match your Bitcoin Core node.',
            default: 'mainnet',
            values: {
              mainnet: 'Mainnet',
              testnet4: 'Testnet4',
              signet: 'Signet',
              regtest: 'Regtest',
            },
          }),
          coinbaseRewardAddress: Value.text({
            name: 'Coinbase Reward Address',
            description: 'Bitcoin address that receives the block reward.',
            required: true,
            default: null,
          }),
          jdcSignature: Value.text({
            name: 'Coinbase Signature',
            description: 'String added to the coinbase scriptSig.',
            required: true,
            default: 'StratumV2 on StartOS',
          }),
        }),
      },
    }),
  }),
  username: Value.text({
    name: 'Username / Worker',
    description:
      'Identity sent upstream (often your payout address or pool username, e.g. address.worker). In sovereign mode any label works.',
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
    description: 'Set the mining mode and connection details.',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const s = await storeJson.read().once()
    const connection =
      s?.mode === 'sovereign'
        ? {
            selection: 'sovereign' as const,
            value: {
              bitcoinNetwork: s.bitcoinNetwork,
              coinbaseRewardAddress: s.coinbaseRewardAddress ?? undefined,
              jdcSignature: s.jdcSignature,
            },
          }
        : {
            selection: 'pool' as const,
            value: {
              poolAddress: s?.poolAddress ?? undefined,
              poolPort: s?.poolPort ?? undefined,
              poolAuthorityPubkey: s?.poolAuthorityPubkey ?? undefined,
            },
          }
    return {
      connection,
      username: s?.username ?? undefined,
      minHashrateThs: s?.minHashrateThs ?? undefined,
      sharesPerMinute: s?.sharesPerMinute ?? undefined,
      extranonce2Size: s?.extranonce2Size ?? undefined,
      aggregateChannels: s?.aggregateChannels ?? undefined,
    }
  },

  async ({ effects, input }) => {
    const common = {
      username: input.username,
      minHashrateThs: input.minHashrateThs,
      sharesPerMinute: input.sharesPerMinute,
      extranonce2Size: input.extranonce2Size,
      aggregateChannels: input.aggregateChannels,
    }
    if (input.connection.selection === 'sovereign') {
      await storeJson.merge(effects, {
        mode: 'sovereign',
        bitcoinNetwork: input.connection.value.bitcoinNetwork,
        coinbaseRewardAddress: input.connection.value.coinbaseRewardAddress,
        jdcSignature: input.connection.value.jdcSignature,
        ...common,
      })
    } else {
      await storeJson.merge(effects, {
        mode: 'pool',
        poolAddress: input.connection.value.poolAddress,
        poolPort: input.connection.value.poolPort,
        poolAuthorityPubkey: input.connection.value.poolAuthorityPubkey,
        ...common,
      })
    }
    await sdk.action.clearTask(effects, requireConfigureReplayId)
  },
)
