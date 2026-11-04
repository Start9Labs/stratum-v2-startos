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
2. **Diff the config schema.** Upstream moves fields between releases without deprecation. `generateTranslatorToml` in `startos/utils.ts` and `startos/jdcConfig.ts` render those files as literal strings, so a schema change is silent until the daemon refuses to start. The authority is the serde structs, not the example configs:

   - `miner-apps/translator/src/lib/config.rs` — `TranslatorConfig`, `Upstream`, `DownstreamDifficultyConfig`
   - `miner-apps/jd-client/src/lib/config.rs` — `JobDeclaratorClientConfig`, `Upstream`
   - `stratum-apps/src/tp_type.rs` — `TemplateProviderType`

3. If the IPC schema version in `jdcConfig.ts` or the Bitcoin versions upstream accepts have moved, update `versionRange` in `startos/dependencies.ts` to match.
