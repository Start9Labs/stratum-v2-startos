# Stratum V2

This service connects your existing miners — which speak the older Stratum V1 protocol (Bitaxe, Antminer, most ASICs) — to **Stratum V2**, in one of three modes:

- **Pool** — your miners mine to a Stratum V2 **pool**.
- **Solo (Sovereign)** — your miners mine to **your own Bitcoin Core node**, with the block reward going to your address. No pool.
- **Job Declaration with Pool** — you build your **own block templates** from your node and declare them to a pool, while the pool still handles payouts. Best of both: you choose the transactions, the pool smooths your income.

## Getting set up

After installing, you'll see a **Configure** task — the service won't start until you complete it. Open **Configure** and pick a **Mining Mode**.

### Pool mode

You need a Stratum V2 pool and three details from it: the pool **address** and **port**, and the pool's **authority public key** (pools publish this). Also set a **username/worker** (often your payout address). Save and start.

### Solo (sovereign) mode

You need **Bitcoin Core (version 31.x)** installed and running on this server. In Configure, choose Solo and set:

- **Bitcoin Network** — must match your node (usually Mainnet).
- **Coinbase Reward Address** — the Bitcoin address that receives the block reward.
- **Coinbase Signature** — any short label embedded in your blocks.

When you start, this service automatically asks Bitcoin Core to enable its IPC socket and won't start until Bitcoin Core is running with IPC on — you'll see a dependency note if anything's missing.

### Job Declaration with Pool mode

Also needs **Bitcoin Core 31.x** running here, **and** a pool that runs a Job Declaration server. In Configure, choose this mode and set both the **pool** details (address, port, authority key, and the pool's **JD Server Port** — often 3334) and the **Bitcoin Network**, a **Coinbase Reward Address** (used as a solo fallback), and a **Coinbase Signature**. Same Bitcoin Core IPC requirement as Solo mode.

## Connecting your miners

1. Open this service's **Interfaces** tab and copy the **Stratum** address — it looks like `stratum+tcp://<your-server>:34255`.
2. In each miner's settings, set the pool/stratum URL to that address and save. Use the `.local` address for miners on your home network.

## Monitoring

- The **Stratum Server** (and, in sovereign mode, **Job Declaration Client**) health checks turn green once everything is connected.
- The **Monitoring API** interface exposes read-only hashrate and share stats.
- Service **Logs** show miners connecting and shares being submitted.

## Changing settings

Re-run **Configure** any time to switch modes or change details; the service restarts with the new settings.

## Limitations

- Solo and JD-with-pool modes need **Bitcoin Core 31.x** on the same server.
- JD-with-pool also needs a pool that runs a Job Declaration server (not all pools do).
- There's no built-in web dashboard; monitoring is via the health checks, the Monitoring API, and logs.
