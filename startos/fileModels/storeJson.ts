import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  mode: z.enum(['pool', 'solo', 'jd-pool']).nullable().catch(null),

  // Pool fields (used by 'pool' and 'jd-pool')
  poolAddress: z.string().nullable().catch(null),
  poolPort: z.number().nullable().catch(null),
  poolAuthorityPubkey: z.string().nullable().catch(null),
  jdsPort: z.number().catch(3334),

  // Job-declaration fields (used by 'solo' and 'jd-pool')
  bitcoinNetwork: z
    .enum(['mainnet', 'testnet4', 'signet', 'regtest'])
    .catch('mainnet'),
  coinbaseRewardAddress: z.string().nullable().catch(null),
  jdcSignature: z.string().catch('StratumV2 on StartOS'),

  // Common
  username: z.string().nullable().catch(null),
  minHashrateThs: z.number().catch(100),
  sharesPerMinute: z.number().catch(6),
  extranonce2Size: z.number().catch(4),
  aggregateChannels: z.boolean().catch(false),
})

export type Store = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
