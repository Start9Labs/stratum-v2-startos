# Stratum V2 UI

Stratum V2 UI helps you point your existing Bitcoin miners at a [Stratum V2](https://stratumprotocol.org/) pool. It runs the Stratum V2 **Translator Proxy** for you and shows a live dashboard of your pool connection, hashrate, workers, and shares.

## What you get

- A **setup wizard** that configures and launches the Translator Proxy.
- A **monitoring dashboard** for pool status, total hashrate, active workers, and submitted shares.
- A **Stratum endpoint** your existing SV1 miners (Bitaxe, Antminer, etc.) connect to.

## Before you start

- The first time you finish setup, this service downloads the Translator image from the internet, so your server needs **internet access** for that initial setup.
- You only need a Stratum V2 **pool** to mine — no Bitcoin node is required for standard pool mining. (Sovereign "Job Declaration" mining, where your own Bitcoin node builds block templates, is not yet supported on StartOS.)

## Getting set up

1. Open the **Web UI** from this service's **Dashboard** tab.
2. Follow the setup wizard: choose your pool and confirm the Translator settings, then finish. The service starts the Translator Proxy in the background.
3. Find your Stratum address: open this service's **Interfaces** tab and copy the **Stratum (Translator Proxy)** address. It looks like `stratum+tcp://<your-server>:34255`.
4. In each miner's settings, set the pool/stratum URL to that address and save. Your miners will appear on the dashboard as they connect.

## Tips

- Use the LAN (`.local`) address for miners on your home network. The dashboard also shows the address miners should use.
- If a miner won't connect, confirm it's on the same network and that you used the full `stratum+tcp://…:34255` URL.

## Limitations

- **Job Declaration (sovereign) mode** — where your own Bitcoin Core node supplies block templates — needs your node's IPC socket and is **not yet supported** on StartOS. Pool mining works fully.
- The Translator image is downloaded on first setup rather than shipped inside the package, so initial setup needs internet access.
