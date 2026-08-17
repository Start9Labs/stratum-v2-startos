// Port the Translator Proxy listens on for SV1 miners (stratum+tcp).
export const stratumPort = 34255

// Translator Proxy's read-only HTTP monitoring API.
export const monitoringPort = 9092

// JD Client's downstream listener (sovereign mode) — local to the subcontainer.
export const jdcPort = 34265

// SRI's well-known JD Client authority keypair (the translator authenticates the
// local JDC with this; not a secret — it's the published SRI default).
export const jdcAuthorityPublicKey =
  '9auqWEzQDVyd2oe1JVGFLMLHZtCo2FFqZwtKA5gd9xbuEu7PH72'
export const jdcAuthoritySecretKey =
  'mkDLTBBRxdBv998612qipDYoTK3YUrqLe8uWw7gu3iXbSrn2n'

// Where Bitcoin Core's IPC socket dir is mounted (sovereign mode only). The JD
// Client resolves the socket as `${dataDir}/[network/]node.sock`.
export const bitcoindIpcDataDir = '/mnt/bitcoind-ipc'

export type BitcoinNetwork = 'mainnet' | 'testnet4' | 'signet' | 'regtest'

// Subdirectory the JD Client appends to data_dir for non-mainnet networks.
export function ipcSocketMountpoint(network: BitcoinNetwork): string {
  return network === 'mainnet'
    ? `${bitcoindIpcDataDir}/node.sock`
    : `${bitcoindIpcDataDir}/${network}/node.sock`
}
