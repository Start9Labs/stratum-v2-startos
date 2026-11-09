import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.2:1',
  releaseNotes: {
    en_US:
      "Requires StartOS 0.4.1 or later. Miners can now connect to the Stratum server over the server's IPv6 addresses.",
    es_ES:
      'Requiere StartOS 0.4.1 o posterior. Los mineros ahora pueden conectarse al servidor Stratum a través de las direcciones IPv6 del servidor.',
    de_DE:
      'Erfordert StartOS 0.4.1 oder neuer. Miner können sich jetzt über die IPv6-Adressen des Servers mit dem Stratum-Server verbinden.',
    pl_PL:
      'Wymaga StartOS 0.4.1 lub nowszego. Koparki mogą teraz łączyć się z serwerem Stratum przez adresy IPv6 serwera.',
    fr_FR:
      'Nécessite StartOS 0.4.1 ou une version ultérieure. Les mineurs peuvent désormais se connecter au serveur Stratum via les adresses IPv6 du serveur.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
