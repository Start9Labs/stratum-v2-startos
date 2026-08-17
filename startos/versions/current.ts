import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.4.0:0',
  releaseNotes: {
    en_US: 'Initial release: Stratum V2 Translator Proxy for StartOS.',
    es_ES: 'Lanzamiento inicial: Translator Proxy de Stratum V2 para StartOS.',
    de_DE: 'Erstveröffentlichung: Stratum-V2-Translator-Proxy für StartOS.',
    pl_PL: 'Pierwsze wydanie: Translator Proxy Stratum V2 dla StartOS.',
    fr_FR: 'Première version : Translator Proxy Stratum V2 pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
