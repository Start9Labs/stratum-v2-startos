# Both SRI binaries in one image so they can run as two daemons in a single
# StartOS subcontainer — one network namespace, so the translator reaches the
# JD Client at 127.0.0.1.
FROM stratumv2/jd_client_sv2:v0.7.0 AS jdc

FROM stratumv2/translator_sv2:v0.7.0
COPY --from=jdc /app/jd_client_sv2 /app/jd_client_sv2
