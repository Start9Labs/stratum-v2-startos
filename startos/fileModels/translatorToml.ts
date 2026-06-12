import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Written from setupMain as an exact string so TOML floats (e.g. `6.0`,
// `100000000000000.0`) survive — the Rust translator's serde fields are f32/f64
// and reject bare integers. See translatorConfig.ts for the generator.
export const translatorToml = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './translator.toml',
})
