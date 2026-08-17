# Combine the SRI Translator Proxy and JD Client binaries into one image so they
# can run as two daemons in a single StartOS subcontainer (shared network
# namespace — the translator reaches the local JD client at 127.0.0.1).
FROM stratumv2/jd_client_sv2:v0.4.0 AS jdc

FROM stratumv2/translator_sv2:v0.4.0
COPY --from=jdc /app/jd_client_sv2 /app/jd_client_sv2
