#!/bin/sh
# Strip net.ipv4.ip_unprivileged_port_start from the OCI spec — runc's reopen of
# that sysctl across a nested userns boundary EPERMs in a StartOS subcontainer.
set -e
bundle=""
prev=""
for arg in "$@"; do
    case "$prev" in --bundle|-b) bundle="$arg"; break;; esac
    case "$arg" in --bundle=*) bundle="${arg#--bundle=}"; break;; esac
    prev="$arg"
done
cfg="${bundle}/config.json"
if [ -n "$bundle" ] && [ -f "$cfg" ]; then
    tmp=$(mktemp "${cfg}.XXXXXX")
    jq 'del(.linux.sysctl["net.ipv4.ip_unprivileged_port_start"])' "$cfg" > "$tmp" && mv "$tmp" "$cfg"
fi
exec /usr/bin/runc "$@"
