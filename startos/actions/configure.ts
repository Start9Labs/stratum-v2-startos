import { storeJson } from '../fileModels/storeJson'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { requireConfigureReplayId } from '../init/taskRequireConfigure'

const { InputSpec, Value, Variants } = sdk

const poolFields = {
  poolAddress: Value.text({
    name: i18n('Pool Address'),
    description: i18n('Hostname or IP of the Stratum V2 pool, without a port.'),
    required: true,
    default: null,
    placeholder: 'pool.example.com',
  }),
  poolPort: Value.number({
    name: i18n('Pool Port'),
    description: i18n('Stratum V2 port of the pool.'),
    required: true,
    default: 34254,
    integer: true,
    min: 1,
    max: 65535,
  }),
  poolAuthorityPubkey: Value.text({
    name: i18n('Pool Authority Public Key'),
    description: i18n("The pool's Stratum V2 authority public key."),
    required: true,
    default: null,
  }),
}

const bitcoinNetwork = Value.select({
  name: i18n('Bitcoin Network'),
  description: i18n('Must match the network your Bitcoin node runs on.'),
  default: 'mainnet',
  values: {
    mainnet: i18n('Mainnet'),
    testnet4: i18n('Testnet4'),
    signet: i18n('Signet'),
    regtest: i18n('Regtest'),
  },
})

const coinbaseRewardAddress = Value.text({
  name: i18n('Coinbase Reward Address'),
  description: i18n(
    'Bitcoin address that receives the block reward. In Job Declaration with Pool mode this is the solo fallback payout.',
  ),
  required: true,
  default: null,
})

const jdcSignature = Value.text({
  name: i18n('Coinbase Signature'),
  description: i18n('Short label embedded in the blocks you mine.'),
  required: true,
  default: 'StratumV2 on StartOS',
})

export const inputSpec = InputSpec.of({
  connection: Value.union({
    name: i18n('Mining Mode'),
    description: i18n(
      'Pool: translate your miners to an external Stratum V2 pool. Solo: mine to your own Bitcoin node. Job Declaration with Pool: build your own block templates and declare them to a pool. The latter two require Bitcoin with IPC enabled.',
    ),
    default: 'pool',
    variants: Variants.of({
      pool: {
        name: i18n('Pool'),
        spec: InputSpec.of({ ...poolFields }),
      },
      solo: {
        name: i18n('Solo (Sovereign)'),
        spec: InputSpec.of({
          bitcoinNetwork,
          coinbaseRewardAddress,
          jdcSignature,
        }),
      },
      'jd-pool': {
        name: i18n('Job Declaration with Pool'),
        spec: InputSpec.of({
          ...poolFields,
          jdsPort: Value.number({
            name: i18n('Job Declaration Server Port'),
            description: i18n("The pool's Job Declaration Server port."),
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
    name: i18n('Username / Worker'),
    description: i18n(
      'Identity sent upstream, often your payout address or pool username in the form address.worker. Any label works in Solo mode.',
    ),
    required: true,
    default: null,
  }),
  minHashrateThs: Value.number({
    name: i18n('Starting Hashrate Estimate (TH/s)'),
    description: i18n(
      'Initial per-miner hashrate hint for vardiff. Difficulty auto-adjusts from here.',
    ),
    required: true,
    default: 100,
    integer: false,
    min: 0,
  }),
  sharesPerMinute: Value.number({
    name: i18n('Shares Per Minute'),
    description: i18n('Target share submission rate per miner.'),
    required: true,
    default: 6,
    integer: false,
    min: 1,
  }),
  extranonce2Size: Value.number({
    name: i18n('Extranonce2 Size'),
    description: i18n(
      'Downstream extranonce2 size in bytes. CGminer accepts at most 8.',
    ),
    required: true,
    default: 4,
    integer: true,
    min: 2,
    max: 8,
  }),
  aggregateChannels: Value.toggle({
    name: i18n('Aggregate Channels'),
    description: i18n(
      'Share a single upstream channel across all miners. Enable for pools that require it, such as Braiins.',
    ),
    default: false,
  }),
})

export const configure = sdk.Action.withInput(
  'configure',

  async ({ effects }) => ({
    name: i18n('Configure'),
    description: i18n('Set the mining mode and connection details.'),
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
