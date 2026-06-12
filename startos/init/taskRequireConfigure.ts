import { configure } from '../actions/configure'
import { sdk } from '../sdk'

export const requireConfigureReplayId = 'require-configure'

export const taskRequireConfigure = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await sdk.action.createOwnTask(effects, configure, 'critical', {
      replayId: requireConfigureReplayId,
      reason: 'Configure a Stratum V2 pool before starting.',
    })
  }
})
