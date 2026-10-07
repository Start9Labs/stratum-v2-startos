export const DEFAULT_LANG = 'en_US'

const dict = {
  // interfaces.ts
  Stratum: 0,
  'Point your SV1 miners here.': 1,
  'Monitoring API': 2,
  'Read-only HTTP API exposing hashrate and share statistics.': 3,

  // main.ts
  'Stratum Server': 10,
  'The Stratum server is ready': 11,
  'The Stratum server is not ready': 12,
  'Job Declaration Client': 13,
  'The Job Declaration Client is ready': 14,
  'The Job Declaration Client is not ready': 15,

  // dependencies.ts
  'Sovereign mining reads block templates from Bitcoin over its IPC socket.': 20,

  // init/taskRequireConfigure.ts
  'Choose a mining mode and connection details before starting.': 30,

  // actions/configure.ts
  Configure: 40,
  'Set the mining mode and connection details.': 41,
  'Mining Mode': 42,
  '- Pool: mine on an external Stratum V2 pool, which builds the block templates and pays out\n- Solo (Sovereign): mine to your own Bitcoin node, with the block reward paid to your own address\n- Job Declaration with Pool: build block templates from your own Bitcoin node and declare them to a pool, which pays out\nSolo and Job Declaration with Pool require Bitcoin with IPC enabled.': 43,
  Pool: 44,
  'Solo (Sovereign)': 45,
  'Job Declaration with Pool': 46,
  'Pool Address': 47,
  'Hostname or IP of the Stratum V2 pool, without a port.': 48,
  'Pool Port': 49,
  "The pool's Stratum V2 port, not its SV1 port.": 50,
  'Pool Authority Public Key': 51,
  'Published by the pool alongside its Stratum V2 address. The connection uses it to verify that it reached that pool.': 52,
  'Job Declaration Server Port': 53,
  'Bitcoin Network': 55,
  'Must match the network your Bitcoin node runs on.\n- Mainnet: the real Bitcoin network\n- Testnet4: the public test network; its coins have no value\n- Signet: a test network whose blocks are signed by a central party; its coins have no value\n- Regtest: a private test network for development': 56,
  Mainnet: 57,
  Testnet4: 58,
  Signet: 59,
  Regtest: 60,
  'Coinbase Reward Address': 61,
  'Bitcoin address that receives the block reward. In Job Declaration with Pool mode this is the solo fallback payout.': 62,
  'Coinbase Signature': 63,
  'Short label embedded in the blocks you mine.': 64,
  'Username / Worker': 65,
  'Identity sent upstream, often your payout address or pool username in the form address.worker. Any label works in Solo mode.': 66,
  'Starting Hashrate Estimate (TH/s)': 67,
  'Initial per-miner hashrate hint for vardiff. Difficulty auto-adjusts from here.': 68,
  'Shares Per Minute': 69,
  "Vardiff adjusts each miner's difficulty so that it submits about this many shares per minute.": 70,
  'Extranonce2 Size': 71,
  'Downstream extranonce2 size in bytes. CGminer accepts at most 8.': 72,
  'Aggregate Channels': 73,
  'Share a single upstream channel across all miners. Enable for pools that require it, such as Braiins.': 74,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
