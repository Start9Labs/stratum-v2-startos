import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.0:1',
  releaseNotes: {
    en_US: `Updated Stratum V2 to 0.8.0.

- Strengthens security and protocol compliance across the application stack
- Improves Translator Proxy session, channel, and late-share handling
- Adds BIP323 version rolling support
- Improves graceful shutdown and upstream DNS failover

[Full release notes](https://github.com/stratum-mining/sv2-apps/releases/tag/v0.8.0)

- Configure's Mining Mode and Bitcoin Network fields explain each option
- Requires Bitcoin 31.0:12 or later`,
    es_ES: `Se actualizó Stratum V2 a la versión 0.8.0.

- Refuerza la seguridad y el cumplimiento del protocolo en todo el conjunto de aplicaciones
- Mejora la gestión de sesiones, canales y participaciones tardías del proxy traductor
- Añade compatibilidad con el version rolling de BIP323
- Mejora el apagado ordenado y la conmutación por error del DNS ascendente

[Notas completas de la versión](https://github.com/stratum-mining/sv2-apps/releases/tag/v0.8.0)

- Los campos Modo de minería y Red de Bitcoin de Configurar explican cada opción
- Requiere Bitcoin 31.0:12 o posterior`,
    de_DE: `Stratum V2 wurde auf Version 0.8.0 aktualisiert.

- Verbessert die Sicherheit und Protokollkonformität im gesamten Anwendungsstapel
- Verbessert die Sitzungs-, Kanal- und Late-Share-Verarbeitung des Translator Proxys
- Fügt Unterstützung für BIP323 Version Rolling hinzu
- Verbessert das geordnete Herunterfahren und das DNS-Failover für Upstream-Verbindungen

[Vollständige Versionshinweise](https://github.com/stratum-mining/sv2-apps/releases/tag/v0.8.0)

- Die Felder Mining-Modus und Bitcoin-Netzwerk in Konfigurieren erklären jede Option
- Erfordert Bitcoin 31.0:12 oder neuer`,
    pl_PL: `Zaktualizowano Stratum V2 do wersji 0.8.0.

- Wzmacnia bezpieczeństwo i zgodność z protokołem w całym stosie aplikacji
- Usprawnia obsługę sesji, kanałów i opóźnionych udziałów w Translator Proxy
- Dodaje obsługę version rolling z BIP323
- Usprawnia kontrolowane zamykanie i przełączanie awaryjne DNS serwerów nadrzędnych

[Pełne informacje o wydaniu](https://github.com/stratum-mining/sv2-apps/releases/tag/v0.8.0)

- Pola Tryb wydobycia i Sieć Bitcoin w akcji Konfiguruj objaśniają każdą opcję
- Wymaga Bitcoin 31.0:12 lub nowszego`,
    fr_FR: `Stratum V2 a été mis à jour vers la version 0.8.0.

- Renforce la sécurité et la conformité au protocole dans l'ensemble des applications
- Améliore la gestion des sessions, des canaux et des partages tardifs du proxy de traduction
- Ajoute la prise en charge du version rolling BIP323
- Améliore l'arrêt ordonné et le basculement DNS des serveurs en amont

[Notes de version complètes](https://github.com/stratum-mining/sv2-apps/releases/tag/v0.8.0)

- Les champs Mode de minage et Réseau Bitcoin de Configurer expliquent chaque option
- Nécessite Bitcoin 31.0:12 ou une version ultérieure`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
