/*
 * https://tools.ietf.org/html/rfc6121
 **/
import xmppDebug from '@xmpp/debug';
import { XmppClient, client as xmppClient, XmlFragment } from '@xmpp/client';

export default class Xmpp {
  public client?: XmppClient;
  public fullJid?: string;
  public isOnline = false;
  public isReady = false;
  public jid?: string;
  public readonly config: Config;
  public readonly lang: string;

  constructor(config: Config) {
    if (!config.hostname && !config.domain) {
      throw new Error('hostname or domain is required');
    }
    if (!config.hostname && !config.service) {
      throw new Error('hostname or service is required');
    }
    this.config = config;
    this.lang = this.config.lang || 'en';
  }

  handleError(err: Error) {
    switch (err.message) {
      default: {
        throw err;
      }
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.isReady = true;
  }

  handleOffline() {
    this.isOnline = false;
    this.isReady = this.isReady;
  }

  async login(username: string, password: string) {
    const domain = this.config.domain || this.config.hostname;
    const resource = this.config.resource || (await this.getResource());
    const service = this.config.service || `wss://${this.config.hostname}/ws`;
    this.jid = `${username}@${domain}`;
    this.fullJid = `${this.jid}/${resource}`;
    try {
      this.client = xmppClient({
        password,
        username,
        service,
        domain,
        resource
      });
      this.client.on('error', this.handleError.bind(this));
      this.client.on('offline', this.handleOffline.bind(this));
      this.client.on('online', this.handleOnline.bind(this));
      if (this.config.debug) xmppDebug(this.client, true);
      await new Promise((resolve, reject) => {
        const handleOnline = async () => {
          await new Promise((r) => setTimeout(r, 1000));
          this.client!.removeListener('online', handleOnline);
          resolve();
        };
        this.client!.on('online', handleOnline);
        try {
          this.client!.start();
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      throw err;
    }
  }

  async handle(
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback
  ) {
    if (!this.client) throw new Error('login to create xmpp client');
    let checkCondition = condition as CheckCondition;
    if (Array.isArray(condition) && condition.length >= 2) {
      checkCondition = (stanza: XmlFragment) => {
        const [namespaceName, id] = condition;
        const queryFragment = stanza.children?.[0];
        if (!queryFragment) return false;
        return (
          stanza.name === 'iq' &&
          stanza.attrs.type === 'result' &&
          stanza.attrs.id === id &&
          queryFragment.name === 'query' &&
          queryFragment.attrs.xmlns === namespaceName
        );
      };
    } else if (typeof condition === 'string') {
      checkCondition = (stanza: XmlFragment) => {
        return (
          stanza.name === 'iq' &&
          stanza.attrs.type === 'result' &&
          stanza.attrs.id === condition
        );
      };
    }
    const listener = (stanza: XmlFragment) => {
      if (checkCondition(stanza)) readCallback(stanza);
    };
    this.client!.on('stanza', listener);
  }

  async query(
    request: any,
    condition: CheckCondition | string | string[] = () => true,
    readCallback?: ReadCallback
  ): Promise<XmlFragment> {
    if (!this.client) throw new Error('login to create xmpp client');
    let checkCondition = condition as CheckCondition;
    if (Array.isArray(condition) && condition.length >= 2) {
      checkCondition = (stanza: XmlFragment) => {
        const [namespaceName, id] = condition;
        const queryFragment = stanza.children?.[0];
        if (!queryFragment) return false;
        return (
          stanza.name === 'iq' &&
          stanza.attrs.type === 'result' &&
          stanza.attrs.id === id &&
          queryFragment.name === 'query' &&
          queryFragment.attrs.xmlns === namespaceName
        );
      };
    } else if (typeof condition === 'string') {
      checkCondition = (stanza: XmlFragment) => {
        return (
          stanza.name === 'iq' &&
          stanza.attrs.type === 'result' &&
          stanza.attrs.id === condition
        );
      };
    }
    if (readCallback) {
      const listener = (stanza: XmlFragment) => {
        if (checkCondition(stanza)) readCallback(stanza);
      };
      this.client.on('stanza', listener);
      this.client.send(request);
      return (null as unknown) as XmlFragment;
    }
    return new Promise((resolve, reject) => {
      const listener = (stanza: XmlFragment) => {
        if (checkCondition(stanza)) {
          this.client!.removeListener('stanza', listener);
          resolve(stanza);
        }
      };
      this.client!.on('stanza', listener);
      try {
        this.client!.send(request);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getResource() {
    return 'abc';
  }
}

export interface Config {
  debug?: boolean;
  domain?: string;
  hostname?: string;
  lang?: string;
  resource?: string;
  service?: string;
}

export type QueryRunner = (
  request: any,
  checkCondition?: CheckCondition | string | string[],
  readCallback?: ReadCallback
) => Promise<XmlFragment>;

export type Handle = (
  checkCondition: CheckCondition | string | string[],
  readCallback: ReadCallback
) => any;

export type CheckCondition = (stanza: XmlFragment) => boolean;

export type ReadCallback = (stanza: XmlFragment) => any;
