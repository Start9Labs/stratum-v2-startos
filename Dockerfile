ARG SV2_UI_VERSION=v0.4.0

FROM node:24-bookworm-slim AS builder
ARG SV2_UI_VERSION
WORKDIR /src
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN git clone --depth 1 --branch "${SV2_UI_VERSION}" https://github.com/stratum-mining/sv2-ui.git .
RUN npm ci
RUN npm run build && npm run build:server

FROM node:24-bookworm-slim
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      curl gnupg ca-certificates fuse-overlayfs uidmap iproute2 iptables \
      slirp4netns jq tini \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg \
        -o /etc/apt/keyrings/docker.asc \
 && chmod a+r /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" \
        > /etc/apt/sources.list.d/docker.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      docker-ce docker-ce-cli containerd.io \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Assemble the sv2-ui app (mirrors upstream Dockerfile's production stage).
COPY --from=builder /src/dist ./public
COPY --from=builder /src/server/dist ./dist
COPY --from=builder /src/server/package.json ./server/
COPY --from=builder /src/package.json /src/package-lock.json ./
COPY --from=builder /src/shared ./shared
RUN npm install --omit=dev -w server && rm -f package.json package-lock.json
RUN mkdir -p /app/node_modules/@sv2-ui && ln -s ../../shared /app/node_modules/@sv2-ui/shared

# Nested-Docker plumbing (see start-docs recipe-nested-oci-runtime).
COPY docker/runc-nested.sh /usr/local/bin/runc-nested
COPY docker/daemon.json /etc/docker/daemon.json
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/runc-nested /usr/local/bin/start.sh

ENV NODE_ENV=production
ENV PORT=8080
ENV CONFIG_DIR=/data/config

ENTRYPOINT ["/usr/bin/tini", "--"]
