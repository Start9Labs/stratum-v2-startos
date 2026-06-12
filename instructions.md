# Stratum V2

This service runs the **Stratum V2 Translator Proxy**. It lets your existing miners — which speak the older Stratum V1 protocol (Bitaxe, Antminer, and most ASICs) — connect to a modern **Stratum V2** pool. Your miners talk to this service; this service talks to the pool.

## What you need first

- A **Stratum V2 pool** to mine with, and three details from it:
  - the pool's **address** (hostname or IP) and **port**,
  - the pool's **authority public key** (pools publish this on their site/docs),
  - a **username / worker** name (often your payout address, e.g. `address.worker`).

## Getting set up

1. After installing, you'll see a **Configure** task — the service won't start until you complete it.
2. Open **Configure** and enter your pool address, port, authority public key, and username. The other fields (hashrate estimate, shares per minute, etc.) have sensible defaults — leave them unless your pool tells you otherwise. Save.
3. **Start** the service.
4. Open this service's **Interfaces** tab and copy the **Stratum** address — it looks like `stratum+tcp://<your-server>:34255`.
5. In each miner's settings, set the pool/stratum URL to that address and save. Use the `.local` address for miners on your home network.

## Monitoring

- The **Stratum Server** health check turns green once the proxy is accepting miners.
- The **Monitoring API** interface exposes read-only hashrate and share statistics if you want to query them from a tool or browser.
- Service **Logs** show miners connecting and shares being submitted.

## Changing settings

Re-run **Configure** at any time to point at a different pool or adjust tuning. The service restarts automatically with the new settings.

## Limitations

- This is **pool mining** (SV1 → SV2 translation). Sovereign "Job Declaration" mining — where your own Bitcoin node builds block templates — is planned for a future release and will require running Bitcoin Core.
- There is no built-in web dashboard; monitoring is via the health check, the Monitoring API, and logs.
