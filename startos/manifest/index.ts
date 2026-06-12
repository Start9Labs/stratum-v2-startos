import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'sv2-ui',
  title: 'Stratum V2 UI',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/sv2-ui-startos',
  upstreamRepo: 'https://github.com/stratum-mining/sv2-ui',
  marketingUrl: 'https://stratumprotocol.org/',
  donationUrl: 'https://opensats.org/',
  description: { short, long },
  volumes: ['main'],
  images: {
    'sv2-ui': {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // Required for the nested Docker engine (/dev/fuse + /dev/net/tun). These
  // manifest flags land in start-sdk 2.0.0 (StartOS 0.4.0-beta.10), not yet on
  // npm. Uncomment and bump the SDK to ship a functional release.
  // userspaceFilesystems: true,
  // virtualNetworking: true,
  alerts: {
    install: {
      en_US:
        'Stratum V2 UI runs a nested Docker engine and pulls the Stratum V2 Translator Proxy image from Docker Hub the first time you complete setup, so the server needs internet access. Miners on your local network connect to the Translator Proxy at the Stratum interface address shown under this service’s Interfaces tab.',
    },
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
