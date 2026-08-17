<p align="center">
  <img src="icon.svg" alt="Stratum V2 Logo" width="21%">
</p>

# Stratum V2 on StartOS

> **Upstream repo:** <https://github.com/stratum-mining/sv2-apps>

Runs the Stratum Reference Implementation (SRI) mining apps as native StartOS daemons. It accepts connections from legacy SV1 miners (Bitaxe, Antminer, etc.) and translates them to Stratum V2, in one of three modes:

- **Pool** — translate your miners to an external Stratum V2 pool.
- **Solo (Sovereign)** — mine solo to your **own Bitcoin Core node**: the JD Client pulls block templates from Bitcoin Core over IPC and the reward goes to your address. No pool.
- **Job Declaration with Pool** — you build your **own block templates** from your node and *declare* them to a pool (which still handles payout/variance). Sovereign job selection while pooling.

No nested Docker, no runtime image pulls — the official multi-arch SRI binaries are baked into the s9pk and run directly; StartOS generates their TOML config.

---

## Table of Contents

- [Architecture](#architecture)
- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Architecture

The image bundles both SRI binaries — `translator_sv2` and `jd_client_sv2` — built from the official `v0.4.0` images.

- **Pool mode:** one daemon, `translator_sv2`, whose upstream is the external pool.
- **Job-declaration modes (solo / jd-pool):** two daemons, `jd_client_sv2` + `translator_sv2`, **sharing one subcontainer** (hence one network namespace) so the translator reaches the JD Client at `127.0.0.1:34265`. The translator's upstream is the local JDC; the JDC's template provider is Bitcoin Core over its IPC socket. The JDC runs `SOLOMINING` (solo) or `FULLTEMPLATE` with the pool's JD server (jd-pool).

All config is rendered by `setupMain` from `store.json` into exact TOML **strings** (the Rust binaries' `f64` fields reject bare integers, so floats like `6.0` must be preserved — a generic TOML serializer would corrupt them).

---

## Image and Container Runtime

| Property      | Value                                                            |
| ------------- | ---------------------------------------------------------------- |
| Image         | Built from `Dockerfile` (FROM `stratumv2/translator_sv2:v0.4.0` + `jd_client_sv2` binary) |
| Binaries      | `/app/translator_sv2`, `/app/jd_client_sv2` (run with `-c <toml>`) |
| Architectures | x86_64, aarch64                                                  |

---

## Volume and Data Layout

| Volume                   | Mount Point         | Purpose                                                    |
| ------------------------ | ------------------- | --------------------------------------------------------- |
| `main`                   | `/data`             | `store.json` (config), generated `translator.toml` / `jdc.toml` |
| `bitcoind:main` (sovereign) | `/mnt/bitcoind-ipc[/<net>]/node.sock` | Bitcoin Core IPC socket, mounted read-only; JDC `data_dir` points here |

---

## Configuration Management

The **Configure** action picks a **Mining Mode** (`Value.union`) and writes `store.json`:

**Pool mode:** Pool Address, Pool Port, Pool Authority Public Key.
**Solo mode:** Bitcoin Network, Coinbase Reward Address, Coinbase Signature.
**JD with Pool mode:** the Pool fields + JD Server Port + the Solo fields (coinbase address is the solo fallback payout).
**Common:** Username/Worker, Starting Hashrate Estimate (TH/s), Shares Per Minute, Extranonce2 Size, Aggregate Channels.

A critical install task (`require-configure`) blocks startup until Configure runs; the handler clears it.

---

## Network Access and Interfaces

| Interface     | Port  | Protocol  | Purpose                                          |
| ------------- | ----- | --------- | ------------------------------------------------ |
| Stratum       | 34255 | TCP (raw) | SV1 miners connect here (`stratum+tcp://…`)        |
| Monitoring API| 9092  | HTTP      | Translator's read-only hashrate/share stats       |

The JD Client's downstream (34265) and monitoring (9091) ports stay internal to the subcontainer.

---

## Actions

| Action | Purpose |
| ------ | ------- |
| Configure | Choose mining mode and connection details; clears the install-time setup task. |

---

## Health Checks

| Check                  | Mode      | Method                 |
| ---------------------- | --------- | ---------------------- |
| Stratum Server         | both      | Port listening (34255) |
| Job Declaration Client | sovereign | Port listening (34265) |

The translator only opens 34255 after its upstream connects, so these go green once the full chain (pool, or Bitcoin Core → JDC) is up.

---

## Dependencies

**`bitcoind` — optional, conditional.** Pool mode is standalone. When `store.json` mode is `solo` or `jd-pool`, `setupDependencies` declares `bitcoind` (`running`, `versionRange >=31.0:0` — IPC is on the Core 31.x branch) and fires a task enforcing its `ipc` action (`enableIpc: true`). `setupMain` then mounts the IPC socket read-only and `checkDependencies().throwIfNotSatisfied()` blocks start until Bitcoin Core is installed, running, and IPC-enabled.

---

## Limitations and Differences

1. **Solo and JD-with-pool modes require Bitcoin Core 31.x** (IPC support) installed on the same server.
2. **No bundled web dashboard.** Upstream's `sv2-ui` (a Docker control-plane) is not used; monitoring is via the health checks, the Monitoring API, and logs.
3. **JD-with-pool needs a pool that runs a JD server (JDS).** Not all Stratum V2 pools do.

---

## Quick Reference for AI Consumers

```yaml
package_id: stratum-v2
image: Dockerfile (stratumv2/translator_sv2:v0.4.0 + jd_client_sv2 binary)  # multi-arch, baked in
architectures: [x86_64, aarch64]
modes:
  pool:    { daemons: [translator], upstream: external pool }
  solo:    { daemons: [jdc, translator], shared_subcontainer: true, jdc_mode: SOLOMINING, template_provider: bitcoind-ipc }
  jd-pool: { daemons: [jdc, translator], shared_subcontainer: true, jdc_mode: FULLTEMPLATE, upstreams: pool+jds, template_provider: bitcoind-ipc }
binaries: /app/translator_sv2 -c /data/translator.toml ; /app/jd_client_sv2 -c /data/jdc.toml
volumes:
  main: /data            # store.json + generated *.toml
ports:
  stratum: 34255         # raw TCP, miners
  monitoring: 9092       # HTTP stats (translator)
  jdc: 34265             # internal (sovereign), localhost only
config: Configure action (Value.union mode select) -> store.json
require_setup: critical own-task 'require-configure'
dependencies:
  bitcoind:              # only when mode in (solo, jd-pool)
    optional: true
    versionRange: ">=31.0:0"
    enforces: { action: ipc, enableIpc: true }
    mount: bitcoind:main/ipc/bitcoin-core.sock -> /mnt/bitcoind-ipc[/<net>]/node.sock (ro)
```
