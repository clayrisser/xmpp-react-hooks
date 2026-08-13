/**
 * Connection details for the throwaway Prosody in `docker/compose.yaml`.
 *
 * The ports default to 15222/15280 rather than the XMPP defaults so a server
 * another project already has on 5222/5280 keeps working; override them
 * through `.env` or the environment.
 */
export const xmppDomain = process.env.XMPP_DOMAIN || 'localhost';

export const websocketPort = Number(process.env.XMPP_WS_PORT || 15280);

export const service = `ws://127.0.0.1:${websocketPort}/xmpp-websocket`;

export const accounts = {
  alice: { password: 'alicepass', username: 'alice' },
  bob: { password: 'bobpass', username: 'bob' },
  carol: { password: 'carolpass', username: 'carol' }
} as const;

export function bareJid(username: string): string {
  return `${username}@${xmppDomain}`;
}

/**
 * Polls the websocket endpoint until Prosody answers, so a container that is
 * still booting produces a clear timeout rather than a connection refused
 * inside the first test.
 */
export async function waitForServer(timeoutMs = 30000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${websocketPort}/xmpp-websocket`);
      // Prosody rejects a plain GET on the websocket route, which is all the
      // proof we need that the HTTP listener is up.
      if (response.status > 0) return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(
    `prosody was not reachable on ${service} — run \`make docker/up-d\` (last error: ${String(lastError)})`
  );
}
