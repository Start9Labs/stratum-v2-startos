// Web UI served by sv2-ui (its Express server).
export const uiPort = 8080

// Stratum port the spawned Translator Proxy listens on for SV1 miners.
export const stratumPort = 34255

// Where Bitcoin Core's IPC socket dir is mounted (JD mode only). The socket
// file the user points the wizard at is `${bitcoindIpcMountpoint}/bitcoin-core.sock`.
export const bitcoindIpcMountpoint = '/mnt/bitcoind-ipc'
