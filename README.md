<p align="center">
  <img src="icon.svg" alt="Stratum V2 Logo" width="21%">
</p>

# Stratum V2 on StartOS

> **Upstream repo:** <https://github.com/stratum-mining/sv2-apps>

Runs the **Stratum V2 Translator Proxy** from the Stratum Reference Implementation (SRI). It accepts connections from legacy SV1 miners (Bitaxe, Antminer, etc.) and translates them to Stratum V2 so you can mine against a Stratum V2 pool.

This package runs the SRI `translator_sv2` binary directly as a StartOS daemon — no nested Docker, no runtime image pulls. The official multi-arch image is baked into the s9pk, and StartOS generates the binary's TOML config from a Configure action.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                  |
| ------------- | ------------------------------------------------------ |
| Image         | `stratumv2/translator_sv2:v0.4.0` (prebuilt, dockerTag)|
| Binary        | `/app/translator_sv2 -c /data/translator.toml`         |
| Architectures | x86_64, aarch64                                        |

---

## Volume and Data Layout

| Volume | Mount Point          | Purpose                                                   |
| ------ | -------------------- | --------------------------------------------------------- |
| `main` | `/data`              | Persistent data root                                      |
|        | `/data/store.json`   | StartOS-managed config (pool details, written by Configure) |
|        | `/data/translator.toml` | Generated each start from `store.json`                 |

`startos/translatorConfig.ts` generates `translator.toml` as an exact string so TOML floats survive (the Rust binary's serde fields are `f32`/`f64` and reject bare integers).

---

## Installation and First-Run Flow

1. On install a **critical task** (`require-configure`) blocks startup until you run **Configure**.
2. Run **Configure** with your pool's address, port, authority public key, and username. This writes `store.json` and clears the task.
3. Start the service. `setupMain` reads `store.json`, regenerates `translator.toml`, and launches the Translator Proxy.
4. Point your SV1 miners at the **Stratum** interface address.

Re-running **Configure** rewrites `store.json`; the reactive `.const()` read in `setupMain` restarts the daemon with the new config.

---

## Configuration Management

All settings live in the **Configure** action → `store.json`:

| Field | Required | Default | TOML target |
| ----- | -------- | ------- | ----------- |
| Pool Address | yes | — | `[[upstreams]].address` |
| Pool Port | yes | 34254 | `[[upstreams]].port` |
| Pool Authority Public Key | yes | — | `[[upstreams]].authority_pubkey` |
| Username / Worker | yes | — | `[[upstreams]].user_identity` |
| Starting Hashrate Estimate (TH/s) | yes | 100 | `min_individual_miner_hashrate` (×1e12 H/s) |
| Shares Per Minute | yes | 6 | `shares_per_minute` |
| Extranonce2 Size | yes | 4 | `downstream_extranonce2_size` |
| Aggregate Channels | no | false | `aggregate_channels` |

---

## Network Access and Interfaces

| Interface     | Port  | Protocol   | Purpose                                        |
| ------------- | ----- | ---------- | ---------------------------------------------- |
| Stratum       | 34255 | TCP (raw)  | SV1 miners connect here (`stratum+tcp://…`)     |
| Monitoring API| 9092  | HTTP       | Read-only hashrate/share stats (`/api/v1/…`)    |

---

## Actions (StartOS UI)

| Action | Purpose |
| ------ | ------- |
| Configure | Set the upstream Stratum V2 pool and translator tuning. Clears the install-time setup task. |

---

## Health Checks

| Check          | Method                 | Messages                                                  |
| -------------- | ---------------------- | --------------------------------------------------------- |
| Stratum Server | Port listening (34255) | "The Stratum server is ready" / "…is not ready" (15s grace) |

---

## Dependencies

None. Pool / SV1-translation mode is fully standalone.

> **Planned — Job Declaration (sovereign) mode.** A future release will add a second `jd_client_sv2` daemon plus a conditional `bitcoind` dependency that enforces Bitcoin Core's IPC socket (`enableIpc`) and mounts it for template building. IPC is available on the Bitcoin Core **31.x** branch.

---

## Limitations and Differences

1. **Pool mode only (for now).** Job Declaration / sovereign mining is not yet wired — see [Dependencies](#dependencies).
2. **No bundled dashboard.** Upstream's `sv2-ui` web dashboard is not included; this package runs the translator natively. Stats are available via the Monitoring API and service logs.
3. **You need a Stratum V2 pool** and its authority public key (pools publish this).

---

## Quick Reference for AI Consumers

```yaml
package_id: stratum-v2
image: stratumv2/translator_sv2:v0.4.0   # prebuilt multi-arch, baked into s9pk
architectures: [x86_64, aarch64]
binary: /app/translator_sv2 -c /data/translator.toml
volumes:
  main: /data            # store.json (config), translator.toml (generated)
ports:
  stratum: 34255         # raw TCP, SV1 miner connections
  monitoring: 9092       # HTTP read-only stats API
actions:
  configure: writes store.json (pool address/port/authority-pubkey/username + tuning)
require_setup: critical own-task 'require-configure' blocks start until Configure runs
dependencies: none       # JD mode (future) would add bitcoind IPC + jd_client_sv2
```
