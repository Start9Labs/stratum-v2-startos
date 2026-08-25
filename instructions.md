# Stratum V2

## Documentation

- [Translator Proxy reference](https://github.com/stratum-mining/sv2-apps/blob/main/miner-apps/translator/README.md) — the SV1-to-SV2 translator's own documentation and full configuration reference.
- [Job Declarator Client reference](https://github.com/stratum-mining/sv2-apps/blob/main/miner-apps/jd-client/README.md) — how job declaration and solo mining work.
- [Stratum V2 specification](https://stratumprotocol.org/specification/) — the protocol itself.

## What you get on StartOS

Your existing miners speak Stratum V1 (Bitaxe, Antminer, and most ASICs). This service sits between them and Stratum V2, in one of three modes:

- **Pool** — your miners mine to a Stratum V2 pool.
- **Solo (Sovereign)** — your miners mine to your own Bitcoin node, and the block reward goes to your address. No pool.
- **Job Declaration with Pool** — you build your own block templates from your node and declare them to a pool, while the pool still handles payouts. You choose the transactions; the pool smooths your income.

Two interfaces are exposed: **Stratum**, which your miners connect to, and a read-only **Monitoring API** with hashrate and share statistics.

## Getting set up

Solo and Job Declaration with Pool both mine from your own node, so **install Bitcoin first** — a version with IPC support. Pool mode needs no Bitcoin node.

1. Open the **Configure** task shown after install and choose a **Mining Mode**.
2. Fill in the fields for that mode:
   - **Pool** — the pool's address, port, and authority public key (pools publish this), plus a username or worker name, often your payout address.
   - **Solo (Sovereign)** — the Bitcoin network your node runs on, the address that should receive the block reward, and a short coinbase signature.
   - **Job Declaration with Pool** — the pool fields above plus the pool's Job Declaration Server port, and the Solo fields; the reward address is used as a solo fallback payout.
3. Save. In the two sovereign modes, StartOS raises a task on Bitcoin asking you to enable its IPC socket — complete it, then start Bitcoin.
4. Start Stratum V2.
5. Copy the **Stratum** address from the Interfaces tab and set it as the pool URL in each miner's settings.

## Using Stratum V2

### Monitoring

The **Stratum Server** health check turns green once the upstream connection is established and your miners can connect; in the sovereign modes the **Job Declaration Client** check turns green once it is receiving templates from your node. The **Monitoring API** interface serves hashrate and share statistics, and the service logs show miners connecting and shares being submitted.

### Configure

Run **Configure** again at any time to switch modes or change connection details. The service picks up the new settings and reconnects.

## Limitations

- The sovereign modes require a Bitcoin version with IPC support, running on this same server.
- Job Declaration with Pool additionally requires a pool that runs a Job Declaration Server; not all Stratum V2 pools do.
