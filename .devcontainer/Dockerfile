FROM mcr.microsoft.com/devcontainers/python:3.14-trixie

# System libraries the local Home Assistant dev instance wants for default_config
# (camera/stream, image handling, dhcp discovery). Not needed by the integration itself.
RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libturbojpeg0 \
        libpcap-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# uv for Python dependency management
COPY --from=ghcr.io/astral-sh/uv:0.13.5 /uv /uvx /usr/local/bin/
