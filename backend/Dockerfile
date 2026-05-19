# Minimal image wrapper to allow custom scripts inside Checkmk.
ARG CMK_IMAGE=checkmk/check-mk-raw:2.2.0-latest
FROM ${CMK_IMAGE}

# Optional: place custom scripts in ./esi and they will be available at /opt/esi
# If no scripts are mounted, this directory can remain empty.
RUN mkdir -p /opt/esi
