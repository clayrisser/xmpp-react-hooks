/*
 * https://tools.ietf.org/html/rfc6121
 * */
import xmppDebug from '@xmpp/debug';
import { XmppClient, client as xmppClient, XmlElement } from '@xmpp/client';

export default class Xmpp {
  public client?: XmppClient;

  public fullJid?: string;

  public isOnline = false;

  public isReady = false;

  public bareJid?: string;

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

  private createCheckCondition(
    condition: CheckCondition | string | string[]
  ): CheckCondition {
    let checkCondition = condition as CheckCondition;
    if (Array.isArray(condition) && condition.length >= 2) {
      checkCondition = (stanzaElement: XmlElement) => {
        const [namespaceName, id] = condition;
        return (
          !!stanzaElement.getChildByAttr('xmlns', namespaceName) &&
          stanzaElement.getAttr('id') === id &&
          stanzaElement.getAttr('type') === 'result' &&
          stanzaElement.name === 'iq'
        );
      };
    } else if (typeof condition === 'string') {
      checkCondition = (stanzaElement: XmlElement) => {
        return (
          stanzaElement.getAttr('id') === condition &&
          stanzaElement.getAttr('type') === 'result' &&
          stanzaElement.name === 'iq'
        );
      };
    }
    return checkCondition;
  }

  private handleError(err: Error) {
    switch (err.message) {
      default: {
        throw err;
      }
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.isReady = true;
  }

  private handleOffline() {
    this.isOnline = false;
    this.isReady = this.isReady;
  }

  private handleStanza(stanza: XmlElement) {
    return stanza;
  }

  async login(username: string, password: string) {
    const domain = this.config.domain || this.config.hostname;
    const resource = this.config.resource || (await this.getResource());
    const service = this.config.service || `wss://${this.config.hostname}/ws`;
    this.bareJid = `${username}@${domain}`;
    this.fullJid = `${this.bareJid}/${resource}`;
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
      this.client.on('stanza', this.handleStanza.bind(this));
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

  handle(
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback,
    event = 'stanza'
  ): Cleanup {
    if (!this.client) throw new Error('login to create xmpp client');
    const checkCondition = this.createCheckCondition(condition);
    const listener = (stanzaElement: XmlElement) => {
      if (checkCondition(stanzaElement)) readCallback(stanzaElement);
    };
    this.client.on(event, listener);
    return () => {
      this.client?.removeListener(event, listener);
    };
  }

  query(
    request: any,
    condition?: CheckCondition | string | string[]
  ): Promise<XmlElement>;
  query(
    request: any,
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback,
    event?: string
  ): Promise<Cleanup>;
  async query(
    request: any,
    condition: CheckCondition | string | string[] = () => true,
    readCallback?: ReadCallback,
    event = 'stanza'
  ): Promise<XmlElement | Cleanup> {
    if (!this.client) throw new Error('login to create xmpp client');
    const checkCondition = this.createCheckCondition(condition);
    if (readCallback) {
      const listener = (stanzaElement: XmlElement) => {
        if (checkCondition(stanzaElement)) readCallback(stanzaElement);
      };
      this.client.on(event, listener);
      this.client.send(request);
      return () => {
        this.client?.removeListener(event, listener);
      };
    }
    return new Promise((resolve, reject) => {
      const listener = (stanza: XmlElement) => {
        if (checkCondition(stanza)) {
          this.client!.removeListener(event, listener);
          resolve(stanza);
        }
      };
      this.client!.on(event, listener);
      try {
        this.client!.send(request);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getResource() {
    // TODO: get resource from xmpp server (if xmpp server does not support getting resource then generate from hashed user agent or hashed mac address)
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
) => Promise<XmlElement>;

export type Handle = (
  checkCondition: CheckCondition | string | string[],
  readCallback: ReadCallback
) => any;

export type CheckCondition = (stanza: XmlElement) => boolean;

export type ReadCallback = (stanza: XmlElement) => any;

export type Cleanup = () => any;
