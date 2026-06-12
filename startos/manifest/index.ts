import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'stratum-v2',
  title: 'Stratum V2',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/sv2-ui-startos',
  upstreamRepo: 'https://github.com/stratum-mining/sv2-apps',
  marketingUrl: 'https://stratumprotocol.org/',
  donationUrl: 'https://opensats.org/',
  description: { short, long },
  volumes: ['main'],
  images: {
    translator: {
      source: { dockerTag: 'stratumv2/translator_sv2:v0.4.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: {
      en_US:
        'Before starting, use the Configure action to set your Stratum V2 pool (address, port, authority public key, and username). Then point your SV1 miners at the Stratum interface address shown under this service’s Interfaces tab.',
    },
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
