export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Stratum V2 UI!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The Stratum V2 UI setup and monitoring dashboard': 5,
  'Stratum (Translator Proxy)': 6,
  'Address SV1 miners point to (stratum+tcp). Available once setup completes.': 7,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
