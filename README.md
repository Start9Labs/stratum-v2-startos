<p align="center">
  <img src="icon.png" alt="Stratum V2 Logo" width="21%">
</p>

# Stratum V2 on StartOS

> Everything not listed in this document should behave the same as upstream
> Stratum V2. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Packages the miner-side applications of the [Stratum Reference Implementation](https://github.com/stratum-mining/sv2-apps) — the Translator Proxy and the Job Declarator Client — as native StartOS daemons. One package covers three mining topologies, selected by a single Configure action; StartOS renders each daemon's TOML from the stored answers.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

A single image carries both upstream binaries, so the two daemons can share one subcontainer and therefore one network namespace.

| Property      | Value                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Image source  | `Dockerfile`, copying `jd_client_sv2` out of its official image into the official `translator_sv2` image |
| Architectures | x86_64, aarch64                                                                                          |
| Entrypoint    | Not used — each daemon runs its binary directly with `-c <toml>`                                         |

Subcontainers, one per mode:

- **`translator-sub`** — Pool mode. Runs `/app/translator_sv2` alone.
- **`sv2-sub`** — Solo and Job Declaration with Pool. Runs `/app/jd_client_sv2` and `/app/translator_sv2` together, which is what lets the translator reach the JD Client on `127.0.0.1`. Separate StartOS images would be separate network namespaces and could not. A `link-ipc-socket` oneshot runs first to place the symlink the JD Client's `data_dir` expects.

Attach with `start-cli package attach stratum-v2 -n <subcontainer-name>`.

## Volume and Data Layout

One volume holds everything the package owns. The Bitcoin IPC socket is mounted in from the dependency in the sovereign modes only.

| Volume          | Mount point                               | Purpose                                                                                    |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `main`          | `/data`                                   | `store.json`, plus the generated `translator.toml` and `jdc.toml`                          |
| `bitcoind:main` | `/mnt/bitcoind-ipc[/<network>]/node.sock` | Bitcoin's IPC socket, read-only; the JD Client's `data_dir` points at the parent directory |

## File Models

The package owns all three files on the volume. Only `store.json` records user intent; the two TOMLs are rendered artifacts and a hand edit to either is discarded.

- **`store.json`** — every answer the Configure action collects, and the only source of user intent. Written by the action, read reactively by `main`, so saving it restarts the daemons with the new settings.
- **`translator.toml`** and **`jdc.toml`** — regenerated from `store.json` on every start and overwritten wholesale. They are modelled as opaque strings rather than TOML documents because upstream types several fields as `f32` and rejects a bare integer where a float is expected; a general-purpose serializer emits `6` for `6.0` and the binary refuses to start. `jdc.toml` exists only in the sovereign modes.

## Dependencies

**`bitcoind`, optional and conditional.** Pool mode declares no dependency at all and runs standalone. Selecting Solo or Job Declaration with Pool makes the dependency appear: the JD Client builds block templates from your own node over its IPC socket, so the package requires Bitcoin running and healthy, mounts its IPC socket read-only, and blocks startup until both hold. It also raises a task on Bitcoin to turn IPC on. IPC is a Bitcoin Core feature; the declared version range admits only the flavors and versions that carry it.

## Network Access and Interfaces

Two interfaces, both bound directly by the daemons.

| Interface      | Id           | Type  | Port  | Purpose                                                        |
| -------------- | ------------ | ----- | ----- | -------------------------------------------------------------- |
| Stratum        | `stratum`    | `p2p` | 34255 | Raw TCP. SV1 miners connect here; the scheme is `stratum+tcp`  |
| Monitoring API | `monitoring` | `api` | 9092  | The Translator Proxy's read-only hashrate and share statistics |

The JD Client's downstream listener (34265) and its own monitoring server (9091) are not exported — the listener binds `127.0.0.1` and is reachable only by the translator sharing its network namespace.

## Installation and First-Run Flow

Nothing runs until the user has answered Configure, because there is no defensible default for a pool address or a payout address.

Install raises a critical task pointing at Configure, which suspends the ordinary controls until it is answered. Running Configure writes `store.json` and clears the task, at which point the service can start. In the sovereign modes the dependency's own task appears on Bitcoin's page and must be completed there before this service will start.

## Actions

One action, which is also the package's entire configuration surface.

**Configure.** Run it to choose a mining mode, and again whenever pool details, payout address, or difficulty tuning change. It writes `store.json` and nothing else — no daemon is touched directly. It is idempotent and safe to repeat, returns immediately, and prefills from the current stored answers. Because `main` reads `store.json` reactively, saving a change restarts the daemons, which drops connected miners for a few seconds while they reconnect. It is allowed in any service status and clears the install-time setup task.

## Tasks

The package raises one task of its own and one on its dependency.

- **Configure this service** — raised once, on install, at `critical` severity, because the daemons cannot start without a pool or payout address. Cleared by running Configure. It does not return.
- **Enable IPC on Bitcoin** — raised on the Bitcoin service's page, at `critical` severity, whenever the mode is Solo or Job Declaration with Pool and Bitcoin's IPC setting is off. Cleared by running Bitcoin's own IPC action. It returns if IPC is later switched back off, and disappears entirely if the mode is changed back to Pool.

## Health Checks

Both checks probe a listening port, so each answers "did this daemon get far enough to serve" rather than "is it mining".

- **Stratum Server** (15s grace) — the Translator Proxy opens its downstream port only after an upstream connection succeeds, so a red check most often means the upstream is unreachable rather than that the translator crashed: check the pool address and authority key in Pool mode, or the Job Declaration Client check in the sovereign modes. The logs name the failing upstream directly.
- **Job Declaration Client** (30s grace, sovereign modes only) — red means the JD Client is not yet listening, which in practice means it has not reached Bitcoin over IPC. Confirm Bitcoin is running with IPC enabled and on the same network the Configure action names; a network mismatch points the client at a socket path that does not exist.

The translator daemon requires the JD Client, so in the sovereign modes a red JD Client check holds the translator down rather than letting it fail against an absent upstream.

## Backups and Restore

The `main` volume is copied wholesale, so a restored instance comes back with its configuration intact and starts mining again as soon as its dependency is satisfied. There is no database and no state worth preserving beyond the configuration — shares and hashrate statistics are in-memory and reset on every start, by upstream's design.

## Limitations and Differences

1. **Miner-side only.** This packages the Translator Proxy and the Job Declarator Client. Upstream's pool-side applications — the SV2 Pool server and the Job Declaration Server — are not included.
2. **No bundled dashboard.** Upstream's separate `sv2-ui` project is a Docker control-plane that spawns these binaries as containers; StartOS runs them directly instead, so that UI has nothing to drive. Monitoring is the health checks, the Monitoring API, and the logs.
3. **The sovereign modes need Bitcoin with IPC on the same server.** They cannot use a remote node.
4. **Job Declaration with Pool needs a pool that runs a Job Declaration Server.** Not all Stratum V2 pools do.
5. **ASIC telemetry is off.** Upstream can scan a LAN subnet for miner web APIs to enrich its monitoring output; this package configures no subnet, so it never scans your network.

---

## Quick Reference for AI Consumers

```yaml
package_id: 'stratum-v2'
image: Dockerfile # stratumv2/translator_sv2 + jd_client_sv2 binary
architectures: [x86_64, aarch64]
subcontainers:
  - translator-sub # pool mode
  - sv2-sub # solo and jd-pool modes
volumes:
  main: /data
file_models:
  - store.json
  - translator.toml
  - jdc.toml
startos_managed_env_vars: []
dependencies: [bitcoind] # only when mode is solo or jd-pool
interfaces:
  stratum: { type: p2p, port: 34255 }
  monitoring: { type: api, port: 9092 }
actions:
  - configure
tasks:
  - { action: configure, severity: critical }
  - { action: 'bitcoind:ipc', severity: critical }
health_checks:
  - translator
  - jdc # sovereign modes only
```
