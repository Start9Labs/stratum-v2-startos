import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  mode: z.enum(['pool', 'sovereign']).nullable().catch(null),

  // Pool mode
  poolAddress: z.string().nullable().catch(null),
  poolPort: z.number().nullable().catch(null),
  poolAuthorityPubkey: z.string().nullable().catch(null),

  // Sovereign (solo) mode
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
