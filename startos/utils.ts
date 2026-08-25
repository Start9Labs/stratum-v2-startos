// Port the Translator Proxy listens on for SV1 miners (stratum+tcp).
export const stratumPort = 34255

// Translator Proxy's read-only HTTP monitoring API.
export const monitoringPort = 9092

// JD Client's downstream listener and monitoring API — local to the subcontainer.
export const jdcPort = 34265
export const jdcMonitoringPort = 9091

// SV2 extension 0x0002, Worker-Specific Hashrate Tracking.
export const workerHashrateExtension = '0x0002'

// SRI's well-known JD Client authority keypair (the translator authenticates the
// local JDC with this; not a secret — it's the published SRI default).
export const jdcAuthorityPublicKey =
  '9auqWEzQDVyd2oe1JVGFLMLHZtCo2FFqZwtKA5gd9xbuEu7PH72'
export const jdcAuthoritySecretKey =
  'mkDLTBBRxdBv998612qipDYoTK3YUrqLe8uWw7gu3iXbSrn2n'

// Where Bitcoin's IPC socket dir is mounted. The JD Client resolves the socket
// as `${dataDir}/[network/]node.sock`.
export const bitcoindIpcDataDir = '/mnt/bitcoind-ipc'

export type BitcoinNetwork = 'mainnet' | 'testnet4' | 'signet' | 'regtest'

export function ipcSocketMountpoint(network: BitcoinNetwork): string {
  return network === 'mainnet'
    ? `${bitcoindIpcDataDir}/node.sock`
    : `${bitcoindIpcDataDir}/${network}/node.sock`
}
