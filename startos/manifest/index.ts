import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'stratum-v2',
  title: 'Stratum V2',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/stratum-v2-startos',
  upstreamRepo: 'https://github.com/stratum-mining/sv2-apps',
  marketingUrl: 'https://stratumprotocol.org/',
  donationUrl: 'https://opensats.org/',
  description: { short, long },
  volumes: ['main'],
  images: {
    sv2: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description:
        'Required only for Sovereign (solo) mode, which builds block templates from your own node over its IPC socket.',
      optional: true,
      metadata: {
        title: 'Bitcoin Core',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/feec0b1dae42961a257948fe39b40caf8672fce1/dep-icon.svg',
      },
    },
  },
})
