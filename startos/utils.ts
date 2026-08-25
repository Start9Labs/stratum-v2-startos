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

// Bitcoin's IPC directory, mounted read-only. It holds `bitcoin-core.sock`,
// but the JD Client resolves its socket as `${dataDir}/[network/]node.sock`, so
// jdcDataDir holds a symlink under that name rather than being the mount itself.
// A dependency mount can only be a directory: MountTarget.filetype is
// skip_deserializing in start-core, so mounting the socket directly is rejected.
export const bitcoindIpcMount = '/mnt/bitcoind-ipc'
export const bitcoindSocketName = 'bitcoin-core.sock'
export const jdcDataDir = '/data/ipc'

export type BitcoinNetwork = 'mainnet' | 'testnet4' | 'signet' | 'regtest'

export function ipcSocketLink(network: BitcoinNetwork): string {
  return network === 'mainnet'
    ? `${jdcDataDir}/node.sock`
    : `${jdcDataDir}/${network}/node.sock`
}
