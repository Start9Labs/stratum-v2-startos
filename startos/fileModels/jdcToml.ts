import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// JD Client config (sovereign mode). Generated as an exact string for the same
// float-typing reason as translator.toml — see jdcConfig.ts.
export const jdcToml = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './jdc.toml',
})
