#!/bin/sh
# Registers the fixture accounts the test suite logs in as, then hands
# off to prosody in the foreground.
set -e

XMPP_DOMAIN="${XMPP_DOMAIN:-localhost}"
XMPP_USERS="${XMPP_USERS:-alice:alicepass bob:bobpass carol:carolpass}"

for entry in $XMPP_USERS; do
	user="${entry%%:*}"
	pass="${entry#*:}"
	prosodyctl deluser "$user@$XMPP_DOMAIN" >/dev/null 2>&1 || true
	printf '%s\n%s\n' "$pass" "$pass" | prosodyctl adduser "$user@$XMPP_DOMAIN"
	echo "registered $user@$XMPP_DOMAIN"
done

exec prosody -F
