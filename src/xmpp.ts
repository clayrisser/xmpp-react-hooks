/*
 * https://tools.ietf.org/html/rfc6121
 **/
import xmppDebug from '@xmpp/debug';
import { XmppClient, client as xmppClient, XmlElement } from '@xmpp/client';

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

  private createCheckCondition(
    condition: CheckCondition | string | string[]
  ): CheckCondition {
    let checkCondition = condition as CheckCondition;
    if (Array.isArray(condition) && condition.length >= 2) {
      checkCondition = (stanzaElement: XmlElement) => {
        const [namespaceName, id] = condition;
        const queryElement = stanzaElement.getChild('query');
        if (!queryElement) return false;
        return (
          queryElement.getAttr('xmlns') === namespaceName &&
          queryElement.name === 'query' &&
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

  handle(
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback
  ): Cleanup {
    if (!this.client) throw new Error('login to create xmpp client');
    const checkCondition = this.createCheckCondition(condition);
    const listener = (stanzaElement: XmlElement) => {
      console.log('listener');
      if (checkCondition(stanzaElement)) readCallback(stanzaElement);
    };
    console.log('test', listener);
    this.client.on('stanza', listener);
    console.log('stanza', listener);
    return () => {
      console.log('remove', listener);
      this.client?.removeListener('stanza', listener);
    };
  }

  query(
    request: any,
    condition?: CheckCondition | string | string[]
  ): Promise<XmlElement>;
  query(
    request: any,
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback
  ): Promise<Cleanup>;
  async query(
    request: any,
    condition: CheckCondition | string | string[] = () => true,
    readCallback?: ReadCallback
  ): Promise<XmlElement | Cleanup> {
    if (!this.client) throw new Error('login to create xmpp client');
    const checkCondition = this.createCheckCondition(condition);
    if (readCallback) {
      const listener = (stanzaElement: XmlElement) => {
        if (checkCondition(stanzaElement)) readCallback(stanzaElement);
      };
      this.client.on('stanza', listener);
      this.client.send(request);
      return () => {
        this.client?.removeListener('stanza', listener);
      };
    }
    return new Promise((resolve, reject) => {
      const listener = (stanza: XmlElement) => {
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
) => Promise<XmlElement>;

export type Handle = (
  checkCondition: CheckCondition | string | string[],
  readCallback: ReadCallback
) => any;

export type CheckCondition = (stanza: XmlElement) => boolean;

export type ReadCallback = (stanza: XmlElement) => any;

export type Cleanup = () => any;
