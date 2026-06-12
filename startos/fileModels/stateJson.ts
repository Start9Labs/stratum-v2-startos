import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// state.json is written by sv2-ui itself (CONFIG_DIR=/data/config). We only
// read `mode` to decide whether Job Declaration mode (which needs Bitcoin Core
// IPC) is active.
const shape = z.object({
  mode: z.enum(['jd', 'no-jd']).nullable().catch(null),
})

export const stateJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './config/state.json' },
  shape,
)
