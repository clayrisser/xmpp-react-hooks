-- Prosody config for the xmpp-react-hooks test suite. Deliberately
-- insecure: plaintext c2s and an unauthenticated websocket origin, so
-- jsdom can connect without a trusted certificate. Never use outside tests.

admins = {}
pidfile = "/run/prosody/prosody.pid"

modules_enabled = {
	"roster",
	"saslauth",
	"tls",
	"dialback",
	"disco",
	"carbons",
	"pep",
	"private",
	"blocklist",
	"vcard4",
	"vcard_legacy",
	"version",
	"uptime",
	"time",
	"ping",
	"admin_adhoc",
	"posix",
	"websocket",
	"http",
}

-- The suite connects over ws:// from jsdom, which has no certificate
-- store, so encryption is off across the board.
c2s_require_encryption = false
s2s_require_encryption = false
allow_unencrypted_plain_auth = true
authentication = "internal_plain"

-- jsdom sets Origin to the test page's origin; accept any of them.
cross_domain_websocket = true
consider_websocket_secure = true

interfaces = { "*" }
c2s_ports = { 5222 }
c2s_direct_tls_ports = {}
legacy_ssl_ports = {}
s2s_ports = {}
http_ports = { 5280 }
https_ports = {}
http_interfaces = { "*" }

log = {
	{ levels = { min = "info" }, to = "console" },
}

storage = "internal"
data_path = "/var/lib/prosody"

VirtualHost "localhost"
