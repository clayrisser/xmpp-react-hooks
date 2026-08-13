FROM debian:bookworm-slim

RUN apt-get update && \
	apt-get install -y --no-install-recommends prosody ca-certificates && \
	rm -rf /var/lib/apt/lists/* && \
	mkdir -p /run/prosody /var/lib/prosody && \
	chown -R prosody:prosody /run/prosody /var/lib/prosody /etc/prosody

COPY prosody.cfg.lua /etc/prosody/prosody.cfg.lua
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Prosody refuses to start as root.
USER prosody

EXPOSE 5222 5280

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
