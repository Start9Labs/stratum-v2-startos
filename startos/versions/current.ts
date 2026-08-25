import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.7.0:0',
  releaseNotes: {
    en_US: 'Initial release.',
    es_ES: 'Lanzamiento inicial.',
    de_DE: 'Erstveröffentlichung.',
    pl_PL: 'Pierwsze wydanie.',
    fr_FR: 'Première version.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
