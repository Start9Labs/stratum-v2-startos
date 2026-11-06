import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.2:0',
  releaseNotes: {
    en_US:
      'Updated Stratum V2 to 0.9.2. Job Declaration with Pool now keeps its connections when a declaration is refused because transactions left the pool node’s mempool, falling back after ten consecutive refusals. Requires StartOS 0.4.1 or later. Full release notes: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.2',
    es_ES:
      'Stratum V2 actualizado a 0.9.2. Declaración de trabajos con pool mantiene las conexiones cuando se rechaza una declaración porque hay transacciones que ya no están en la mempool del nodo del pool, y activa el modo de respaldo tras diez rechazos consecutivos. Requiere StartOS 0.4.1 o posterior. Notas completas: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.2',
    de_DE:
      'Stratum V2 auf 0.9.2 aktualisiert. Die Job-Deklaration mit Pool hält die Verbindungen bei abgelehnten Deklarationen aufrecht, wenn Transaktionen den Mempool des Pool-Nodes verlassen haben, und wechselt nach zehn aufeinanderfolgenden Ablehnungen in den Ausweichbetrieb. Erfordert StartOS 0.4.1 oder neuer. Vollständige Versionshinweise: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.2',
    pl_PL:
      'Zaktualizowano Stratum V2 do 0.9.2. Deklarowanie zadań z pulą utrzymuje połączenia po odrzuceniu deklaracji z powodu transakcji usuniętych z mempool węzła puli, a po dziesięciu kolejnych odrzuceniach przełącza się na tryb awaryjny. Wymaga StartOS 0.4.1 lub nowszego. Pełne informacje o wydaniu: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.2',
    fr_FR:
      'Stratum V2 mis à jour vers 0.9.2. La déclaration de travaux avec pool conserve ses connexions lorsqu’une déclaration est refusée après la sortie de transactions de la mempool du nœud du pool, et bascule en mode de secours après dix refus consécutifs. Nécessite StartOS 0.4.1 ou ultérieur. Notes complètes : https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.2',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
