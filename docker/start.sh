#!/bin/bash
set -e

mkdir -p /data/config /data/docker

# sv2-ui's monitoring proxy targets the spawned containers by name; the nested
# containers publish their monitoring ports onto the subcontainer's loopback.
if ! grep -q 'sv2-translator' /etc/hosts; then
    echo '127.0.0.1 sv2-translator sv2-jdc' >> /etc/hosts
fi

rm -f /var/run/docker.pid /var/run/docker.sock

dockerd >/data/dockerd.log 2>&1 &
dockerd_pid=$!

echo "Waiting for dockerd..."
for _ in $(seq 1 60); do
    if docker info >/dev/null 2>&1; then
        echo "dockerd is ready"
        break
    fi
    if ! kill -0 "$dockerd_pid" 2>/dev/null; then
        echo "dockerd exited during startup:"
        cat /data/dockerd.log
        exit 1
    fi
    sleep 1
done

if ! docker info >/dev/null 2>&1; then
    echo "dockerd did not become ready in time:"
    cat /data/dockerd.log
    exit 1
fi

exec node --import tsx /app/dist/index.js
