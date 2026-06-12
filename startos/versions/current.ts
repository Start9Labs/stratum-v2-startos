import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.4.0:0',
  releaseNotes: {
    en_US: 'Initial release of Stratum V2 UI for StartOS.',
    es_ES: 'Lanzamiento inicial de Stratum V2 UI para StartOS.',
    de_DE: 'Erstveröffentlichung von Stratum V2 UI für StartOS.',
    pl_PL: 'Pierwsze wydanie Stratum V2 UI dla StartOS.',
    fr_FR: 'Première version de Stratum V2 UI pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
