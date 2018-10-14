import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';
import { sleep } from '../../utils';
import { Observable } from '../../utils/Observable';

const { RNSSH } = NativeModules;

const RNSSHEmitter = new NativeEventEmitter(RNSSH);

export type Handler = (body: string) => void;
export type PtyType = 'vanilla' | 'vt100' | 'vt102' | 'vt220' | 'ansi' | 'xterm';
export type Event = 'Shell';

export interface Credential {
  type: 'password' | 'ssh';
  password?: string;
  privateKey?: string;
  publicKey?: string;
  passphrase?: string;
}

export interface SSHShellEvent {
  name: 'message' | 'error' | 'close';
  body: string;
}

export interface SSHEvent {
  key: string;
  name: 'Shell';
  body: SSHShellEvent;
}

type EventName = 'Shell';

export type ShellHandler = (evnet: 'output' | 'close', body: string) => void;

type EventInvok = ShellHandler;

// 'Connecting' | 'Connected' | 'Authenticating' | 'Authenticated'

export class SSHClient extends Observable<EventName, EventInvok> {
  link: Promise<string>;
  status: 'Link' | 'Shell' | 'Failure' = 'Link';
  message?: string;
  target: string;
  shellListener?: EmitterSubscription;
  constructor(hostname: string, port: number, username: string, credential: Credential) {
    super('Shell');
    this.target = `${username}@${hostname}:${port}`;
    this.link = RNSSH.link(hostname, port, username, credential);
  }

  async isConnected(): Promise<boolean> {
    const clientKey = await this.link;
    return await RNSSH.isConnected(clientKey);
  }

  async connect(timeout: number = 10000): Promise<void> {
    const clientKey = await this.link;
    await RNSSH.connect(
      clientKey,
      timeout
    );
  }

  async isAuthorized(): Promise<boolean> {
    const clientKey = await this.link;
    return await RNSSH.isAuthorized(clientKey);
  }

  async authenticate(): Promise<void> {
    const clientKey = await this.link;
    await RNSSH.authenticate(clientKey);
  }

  async disconnect(): Promise<void> {
    await this.closeShell();
    return await RNSSH.disconnect(await this.link);
  }

  async execute(command: string): Promise<string> {
    const clientKey = await this.link;
    return await RNSSH.execute(clientKey, command);
  }

  async startShell(ptyType: PtyType): Promise<void> {
    const clientKey = await this.link;
    this.shellListener = RNSSHEmitter.addListener('Shell', this.handleEvent);
    await RNSSH.startShell(clientKey, ptyType);
  }

  async resizeShell(width: number, height: number): Promise<void> {
    const clientKey = await this.link;
    await RNSSH.resizeShell(clientKey, width, height);
  }

  async writeToShell(command: string): Promise<void> {
    if (!this.shellListener) {
      console.log(`shell is close, the input(${command}) is invalid`);
      return;
    }
    const clientKey = await this.link;
    await RNSSH.writeToShell(clientKey, command);
  }

  async closeShell(passive: boolean = false): Promise<void> {
    try {
      this.fireEvent('Shell', 'close');
      this.un('Shell');
      if (!passive) {
        const clientKey = await this.link;
        await RNSSH.closeShell(clientKey);
      }
    } finally {
      if (this.shellListener) {
        this.shellListener.remove();
        this.shellListener = undefined;
      }
    }
  }

  private handleShellEvent = (event: SSHShellEvent) => {
    console.log('handle shell event', event);
    switch (event.name) {
      case 'message':
        this.fireEvent('Shell', 'output', event.body);
        break;
      case 'error':
        break;
      case 'close':
        this.closeShell(true);
        break;
      default:
        console.warn(event.name, event);
    }
  };

  private handleEvent = async (event: SSHEvent) => {
    const clientKey = await this.link;
    if (clientKey !== event.key) {
      return;
    }
    if (this.supportedEvents().indexOf(event.name) === -1) {
      console.warn(event);
      return;
    }
    switch (event.name) {
      case 'Shell':
        this.handleShellEvent(event.body as SSHShellEvent);
        break;
      default:
        console.warn(event.name, event);
    }
  };

  toString() {
    return this.target;
  }
}
