import { storeJson } from '../fileModels/storeJson'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { requireConfigureReplayId } from '../init/taskRequireConfigure'

const { InputSpec, Value, Variants } = sdk

// Each regex carries its field's length: the SDK enforces `patterns` server-side, but not `maxLength`.
const patterns = {
  poolAddress: {
    regex: '^([A-Za-z0-9.-]{1,253}|\\[?[0-9A-Fa-f:.]{2,45}\\]?)$',
    description: i18n('Must be a hostname or IP address, without a port.'),
  },
  poolAuthorityPubkey: {
    regex: '^[1-9A-HJ-NP-Za-km-z]{51}$',
    description: i18n(
      'Must be a Stratum V2 authority public key: 51 base58 characters.',
    ),
  },
  coinbaseRewardAddress: {
    regex:
      '^([13mn2][a-km-zA-HJ-NP-Z1-9]{25,39}|(bc|tb|bcrt)1[a-z0-9]{6,90}|(BC|TB|BCRT)1[A-Z0-9]{6,90})$',
    description: i18n('Must be a Bitcoin address.'),
  },
  jdcSignature: {
    regex: '^[ -~]{1,32}$',
    description: i18n('Must be at most 32 printable ASCII characters.'),
  },
  username: {
    regex: '^[^\\s"\\\\]{1,255}$',
    description: i18n(
      'Must be at most 255 characters, with no spaces, quotes or backslashes.',
    ),
  },
}

function check(field: keyof typeof patterns, value: string) {
  if (!new RegExp(patterns[field].regex).test(value)) {
    throw new Error(patterns[field].description)
  }
}

const poolFields = {
  poolAddress: Value.text({
    name: i18n('Pool Address'),
    description: i18n('Hostname or IP of the Stratum V2 pool, without a port.'),
    required: true,
    default: null,
    placeholder: 'pool.example.com',
    maxLength: 253,
    patterns: [patterns.poolAddress],
  }),
  poolPort: Value.number({
    name: i18n('Pool Port'),
    description: i18n("The pool's Stratum V2 port, not its SV1 port."),
    required: true,
    default: 34254,
    integer: true,
    min: 1,
    max: 65535,
  }),
  poolAuthorityPubkey: Value.text({
    name: i18n('Pool Authority Public Key'),
    description: i18n(
      'Published by the pool alongside its Stratum V2 address. The connection uses it to verify that it reached that pool.',
    ),
    required: true,
    default: null,
    maxLength: 51,
    patterns: [patterns.poolAuthorityPubkey],
  }),
}

const bitcoinNetwork = Value.select({
  name: i18n('Bitcoin Network'),
  description: i18n(
    'Must match the network your Bitcoin node runs on.\n- Mainnet: the real Bitcoin network\n- Testnet4: the public test network; its coins have no value\n- Signet: a test network whose blocks are signed by a central party; its coins have no value\n- Regtest: a private test network for development',
  ),
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
  patterns: [patterns.coinbaseRewardAddress],
})

const jdcSignature = Value.text({
  name: i18n('Coinbase Signature'),
  description: i18n('Short label embedded in the blocks you mine.'),
  required: true,
  default: 'StratumV2 on StartOS',
  maxLength: 32,
  patterns: [patterns.jdcSignature],
})

export const inputSpec = InputSpec.of({
  connection: Value.union({
    name: i18n('Mining Mode'),
    description: i18n(
      '- Pool: mine on an external Stratum V2 pool, which builds the block templates and pays out\n- Solo (Sovereign): mine to your own Bitcoin node, with the block reward paid to your own address\n- Job Declaration with Pool: build block templates from your own Bitcoin node and declare them to a pool, which pays out\nSolo and Job Declaration with Pool require Bitcoin with IPC enabled.',
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
            description: null,
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
    maxLength: 255,
    patterns: [patterns.username],
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
    description: i18n(
      "Vardiff adjusts each miner's difficulty so that it submits about this many shares per minute.",
    ),
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
    const c = input.connection
    check('username', input.username)
    if (c.selection !== 'solo') {
      check('poolAddress', c.value.poolAddress)
      check('poolAuthorityPubkey', c.value.poolAuthorityPubkey)
    }
    if (c.selection !== 'pool') {
      check('coinbaseRewardAddress', c.value.coinbaseRewardAddress)
      check('jdcSignature', c.value.jdcSignature)
    }
    const common = {
      username: input.username,
      minHashrateThs: input.minHashrateThs,
      sharesPerMinute: input.sharesPerMinute,
      extranonce2Size: input.extranonce2Size,
      aggregateChannels: input.aggregateChannels,
    }
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
