import { storeJson } from '../fileModels/storeJson'
import { sdk } from '../sdk'
import { requireConfigureReplayId } from '../init/taskRequireConfigure'

const { InputSpec, Value, Variants } = sdk

const poolFields = {
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
}

const bitcoinNetwork = Value.select({
  name: 'Bitcoin Network',
  description: 'Must match your Bitcoin Core node.',
  default: 'mainnet',
  values: {
    mainnet: 'Mainnet',
    testnet4: 'Testnet4',
    signet: 'Signet',
    regtest: 'Regtest',
  },
})

const coinbaseRewardAddress = Value.text({
  name: 'Coinbase Reward Address',
  description:
    'Bitcoin address that receives the block reward (the solo fallback payout in JD-with-pool mode).',
  required: true,
  default: null,
})

const jdcSignature = Value.text({
  name: 'Coinbase Signature',
  description: 'String added to the coinbase scriptSig.',
  required: true,
  default: 'StratumV2 on StartOS',
})

export const inputSpec = InputSpec.of({
  connection: Value.union({
    name: 'Mining Mode',
    description:
      'Pool: translate SV1 miners to a Stratum V2 pool. Solo: mine to your own Bitcoin Core node. JD with Pool: declare your own block templates to a pool. The two latter modes need Bitcoin Core 31.x with IPC.',
    default: 'pool',
    variants: Variants.of({
      pool: {
        name: 'Pool',
        spec: InputSpec.of({ ...poolFields }),
      },
      solo: {
        name: 'Solo (Sovereign)',
        spec: InputSpec.of({
          bitcoinNetwork,
          coinbaseRewardAddress,
          jdcSignature,
        }),
      },
      'jd-pool': {
        name: 'Job Declaration with Pool',
        spec: InputSpec.of({
          ...poolFields,
          jdsPort: Value.number({
            name: 'Job Declaration Server Port',
            description: "The pool's JD server (JDS) port.",
            required: true,
            default: 3334,
            integer: true,
            min: 1,
            max: 65535,
          }),
          bitcoinNetwork,
          coinbaseRewardAddress,
          jdcSignature,
        }),
      },
    }),
  }),
  username: Value.text({
    name: 'Username / Worker',
    description:
      'Identity sent upstream (often your payout address or pool username, e.g. address.worker). In solo mode any label works.',
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
    const pool = {
      poolAddress: s?.poolAddress ?? undefined,
      poolPort: s?.poolPort ?? undefined,
      poolAuthorityPubkey: s?.poolAuthorityPubkey ?? undefined,
    }
    const jd = {
      bitcoinNetwork: s?.bitcoinNetwork,
      coinbaseRewardAddress: s?.coinbaseRewardAddress ?? undefined,
      jdcSignature: s?.jdcSignature,
    }
    const connection =
      s?.mode === 'solo'
        ? { selection: 'solo' as const, value: jd }
        : s?.mode === 'jd-pool'
          ? {
              selection: 'jd-pool' as const,
              value: { ...pool, jdsPort: s?.jdsPort, ...jd },
            }
          : { selection: 'pool' as const, value: pool }
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
    const c = input.connection
    if (c.selection === 'solo') {
      await storeJson.merge(effects, {
        mode: 'solo',
        bitcoinNetwork: c.value.bitcoinNetwork,
        coinbaseRewardAddress: c.value.coinbaseRewardAddress,
        jdcSignature: c.value.jdcSignature,
        ...common,
      })
    } else if (c.selection === 'jd-pool') {
      await storeJson.merge(effects, {
        mode: 'jd-pool',
        poolAddress: c.value.poolAddress,
        poolPort: c.value.poolPort,
        poolAuthorityPubkey: c.value.poolAuthorityPubkey,
        jdsPort: c.value.jdsPort,
        bitcoinNetwork: c.value.bitcoinNetwork,
        coinbaseRewardAddress: c.value.coinbaseRewardAddress,
        jdcSignature: c.value.jdcSignature,
        ...common,
      })
    } else {
      await storeJson.merge(effects, {
        mode: 'pool',
        poolAddress: c.value.poolAddress,
        poolPort: c.value.poolPort,
        poolAuthorityPubkey: c.value.poolAuthorityPubkey,
        ...common,
      })
    }
    await sdk.action.clearTask(effects, requireConfigureReplayId)
  },
)
