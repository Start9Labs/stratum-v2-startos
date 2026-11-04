import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.0:0',
  releaseNotes: {
    en_US:
      'Updated Stratum V2 to 0.9.0. Improves job declaration reliability, rejects invalid mining targets and hashrates, and fixes channel-state leaks. Full release notes: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.0',
    es_ES:
      'Stratum V2 actualizado a 0.9.0. Mejora la fiabilidad de la declaración de trabajos, rechaza objetivos y tasas de hash de minería no válidos y corrige fugas de estado de los canales. Notas completas: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.0',
    de_DE:
      'Stratum V2 auf 0.9.0 aktualisiert. Verbessert die Zuverlässigkeit der Job-Deklaration, weist ungültige Mining-Ziele und Hashraten zurück und behebt Speicherlecks im Kanalzustand. Vollständige Versionshinweise: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.0',
    pl_PL:
      'Zaktualizowano Stratum V2 do 0.9.0. Poprawiono niezawodność deklarowania zadań, odrzucanie nieprawidłowych celów wydobycia i wartości hashrate oraz usunięto wycieki stanu kanałów. Pełne informacje o wydaniu: https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.0',
    fr_FR:
      'Stratum V2 mis à jour vers 0.9.0. Améliore la fiabilité de la déclaration des travaux, rejette les cibles et taux de hachage de minage invalides et corrige les fuites d’état des canaux. Notes complètes : https://github.com/stratum-mining/sv2-apps/releases/tag/v0.9.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
