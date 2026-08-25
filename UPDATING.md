# Updating the upstream version

Upstream is [stratum-mining/sv2-apps](https://github.com/stratum-mining/sv2-apps), the Stratum Reference Implementation. It publishes an official multi-arch image per application on Docker Hub under the `stratumv2` namespace, tagged with the release tag; this package pulls two of them — `translator_sv2` and `jd_client_sv2` — and combines them into one image.

## Determining the upstream version

Fetch the latest release tag:

```sh
gh release view -R stratum-mining/sv2-apps --json tagName -q .tagName
```

The current pin is the tag on both `FROM` lines in `Dockerfile`. Confirm both images carry that tag before bumping — they are published together, but a release that fails to push one of them would break the build:

```sh
for i in translator_sv2 jd_client_sv2; do
  curl -s "https://hub.docker.com/v2/repositories/stratumv2/$i/tags/<tag>" | jq -r '.name // "missing"'
done
```

## Applying the bump

1. Set the new tag on both `FROM` lines in `Dockerfile`, and set `version` in `startos/versions/current.ts` to `<upstream>:0`.
2. **Diff the config schema.** Upstream moves fields between releases without deprecation — `user_identity` has changed nesting, and `template_provider_type.BitcoinCoreIpc` has gained required fields. `startos/translatorConfig.ts` and `startos/jdcConfig.ts` render those files as literal strings, so a schema change is silent until the daemon refuses to start. The authority is the serde structs, not the example configs:

   - `miner-apps/translator/src/lib/config.rs` — `TranslatorConfig`, `Upstream`, `DownstreamDifficultyConfig`
   - `miner-apps/jd-client/src/lib/config.rs` — `JobDeclaratorClientConfig`, `Upstream`
   - `stratum-apps/src/tp_type.rs` — `TemplateProviderType`

   A field typed `Hashrate` or `SharesPerMinute` is an `f32` and rejects a bare integer, which is why the generators emit floats as strings.

3. **Validate the rendered configs against the new binaries** before opening a PR. Build the generators, write the four combinations out, and run each binary against them — it parses the whole file before opening a socket, so a config error surfaces immediately and a network error means the config was accepted:

   ```sh
   docker run --rm --network none --entrypoint /app/translator_sv2 \
     -v "$PWD/translator.toml:/cfg.toml:ro" stratumv2/translator_sv2:<tag> -c /cfg.toml
   ```

   The JD Client logs the IPC socket path it resolved; check it matches `ipcSocketMountpoint()` in `startos/utils.ts` for a non-mainnet network as well as mainnet.

4. If the IPC schema version in `jdcConfig.ts` or the Bitcoin versions upstream accepts have moved, update `versionRange` in `startos/dependencies.ts` to match.
