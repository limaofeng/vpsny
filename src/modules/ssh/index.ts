import { AnyAction, Dispatch, Store } from 'redux';
import { Feature, InAction } from 'walkuere-rn';

import { ReduxState } from '..';
import { sleep, uuid } from '../../utils';
import { KeyPair } from './../cloud/type';
import SSHConnect from './components/SSHConnect';
import { Credential, SSHClient } from './SSHClient';
import { Command, SSHConnection } from './type';
import Terminal from './views/Terminal';

const clients = new Map<string, SSHClient>();

/**
 * 获取实例的 SSHClient
 * @param id 实例的ID
 */
export const getSSHClient = (id: string): SSHClient => {
  return clients.get(id) as SSHClient;
};

let supervisor: ShellSupervisor;
type Select = (finder: (state: ReduxState) => any) => any;

export function getShellSupervisor() {
  return supervisor;
}

class ShellSupervisor {
  select: Select;
  shells = new Map<string, SSHClient>();
  constructor(select: Select) {
    this.select = select;
    this.monitoring();
  }

  async monitoring() {
    do {
      for (const key of this.shells.keys()) {
        if (!this.shells.has(key)) {
          continue;
        }
        const client = this.shells.get(key) as SSHClient;
        try {
          if (!client.isConnected()) {
            this.shells.delete(key);
          } else {
            console.info(`定时检查： shell 连接正常。 ${key} - ${client.target}`);
          }
        } catch (e) {
          console.warn(`定时检查： shell 连接异常! 移除 ${key} - ${client.target}`);
        }
      }
      await sleep(3000);
    } while (true);
  }

  getShell(connection: SSHConnection) {
    const { id } = connection;
    if (this.shells.has(id)) {
      return this.shells.get(id);
    }
    const { hostname, port, password, username, keyPair: fingerprint } = connection;
    const keyPairs: KeyPair[] = this.select(({ settings: { keyPairs } }) => keyPairs);
    const keyPair = keyPairs.find(key => key.publicKeyFingerprint === fingerprint) as KeyPair;
    const client = configureClient(hostname, port, username, {
      type: keyPair ? 'ssh' : 'password',
      password,
      privateKey: keyPair && keyPair.privateKey,
      passphrase: keyPair && keyPair.passphrase,
      publicKey: keyPair && keyPair.publicKey
    });
    this.shells.set(id, client);
    console.log('setup shells ->', Array.from(this.shells.values()).map(shell => shell.target));

    // 监听 Shell 关闭
    client.on('Shell', event => {
      if (event === 'close') {
        const client = this.shells.get(id) as SSHClient;
        this.shells.delete(id);
        console.log('drop shells ->', client.target);
        setTimeout(() => {
          client.disconnect();
        }, 500);
      }
    });
    return client;
  }
}

const configureClient = (address: string, port: number = 22, username: string, credential: Credential): SSHClient => {
  return new SSHClient(address, port, username, credential);
};

export interface SSHState {
  connections: SSHConnection[];
  commands: Command[];
}

interface ExecAction extends AnyAction {
  payload: {
    id?: string;
    node?: string;
    command: string;
  };
}

interface CommandAction extends AnyAction {
  payload: Command;
}

export default new Feature({
  routes: {
    Terminal,
    SSHConnect
  },
  namespace: 'ssh',
  state: {
    connections: [],
    commands: []
  },
  reducers: {
    insertCommand({ commands, ...state }: SSHState, { payload: command }: CommandAction) {
      return { ...state, commands: [{ ...command, createdAt: Date.now() }, ...commands] };
    },
    updateCommand({ commands, ...state }: SSHState, { payload: command }: CommandAction) {
      return {
        ...state,
        commands: commands.map(cmd => (cmd.id === command.id ? { ...cmd, ...command } : cmd))
      };
    },
    deleteCommand({ commands, ...state }: SSHState, { payload: { id } }: CommandAction) {
      return { ...state, commands: commands.filter(cmd => cmd.id !== id) };
    },
    insertConnection({ connections, ...state }: SSHState, { payload: connection }: any) {
      return { ...state, connections: [...connections, connection] };
    },
    updateConnection({ connections, ...state }: SSHState, { payload: connection }: any) {
      return {
        ...state,
        connections: connections.map(con => (con.id === connection.id ? { ...con, ...connection } : con))
      };
    },
    deleteConnection({ connections, ...state }: SSHState, { payload: { id } }: any) {
      clients.delete(id);
      return { ...state, connections: connections.filter(con => con.id !== id) };
    }
  },
  effects: {
    *connection({ payload }: InAction<SSHConnection>, { select, put }: any) {
      const old: SSHConnection = yield select(({ ssh: { connections } }: ReduxState) =>
        connections.find(con => con.id === payload.id)
      );
      // const keyPairs: KeyPair[] = yield select(({ settings: { keyPairs } }: ReduxState) => keyPairs);
      // const keyPair = keyPairs.find(key => key.publicKeyFingerprint === fingerprint) as KeyPair;
      // const { id, hostname, port, password, username, keyPair: fingerprint } = payload;
      // const client = configureClient(hostname, port, username, {
      //   type: keyPair ? 'ssh' : 'password',
      //   password,
      //   privateKey: keyPair && keyPair.privateKey,
      //   passphrase: keyPair && keyPair.passphrase,
      //   publicKey: keyPair && keyPair.publicKey
      // });
      // clients.set(id, client);
      if (old) {
        yield put({
          type: 'updateConnection',
          payload: payload
        });
      } else {
        yield put({ type: 'insertConnection', payload: { ...payload, status: 'unauthorized' } });
      }
    },
    *exec({ payload: { id, node, command: input } }: ExecAction, { put, call, select }: any) {
      let clientKey;
      let command: Command;
      if (id) {
        const cmd = yield select(({ ssh: { commands } }: ReduxState) => ({ ...commands.find(cmd => cmd.id === id) }));
        clientKey = cmd.host;
        command = cmd;
      } else {
        const connection = yield select(({ ssh: { connections } }: ReduxState) =>
          connections.find(con => con.id === node)
        );
        clientKey = `${connection.username}@${connection.hostname}:${connection.port}`;
        command = {
          id: uuid(),
          node: node as string,
          host: clientKey,
          lables: [],
          status: 'connecting',
          input
        };
        yield put({ type: 'insertCommand', payload: command });
      }

      const client = clients.get(clientKey) as SSHClient;

      const start = Date.now();
      try {
        // 连接
        yield call([client, 'reconnect']);
        // 更新
        yield put({ type: 'updateCommand', payload: { ...command, status: 'executing' } });
        // 执行
        const output = yield call([client, 'execute'], input);
        // 执行成功
        yield put({ type: 'updateCommand', payload: { ...command, status: 'success', time: Date.now() - start } });
        console.log(output);
      } catch (e) {
        yield put({ type: 'updateCommand', payload: { ...command, status: 'failure', time: Date.now() - start } });
      }
    }
  },
  subscriptions: {
    async setup({ dispatch, state, store }: { dispatch: Dispatch; state: SSHState; store: Store }) {
      // supervisor = new ShellSupervisor(finder => finder(store.getState()));

      // const { keyPairs } = store.getState().settings as SettingState;
      // for (const { id, hostname, port, password, username, keyPair: fingerprint } of state.connections) {
      //   const keyPair = keyPairs.find(key => key.publicKeyFingerprint === fingerprint) as KeyPair;
      //   const client = configureClient(hostname, port, username, {
      //     type: keyPair ? 'ssh' : 'password',
      //     password,
      //     privateKey: keyPair && keyPair.privateKey,
      //     passphrase: keyPair && keyPair.passphrase,
      //     publicKey: keyPair && keyPair.publicKey
      //   });
      //   clients.set(id, client);
      // }
      console.log('setup connections ->', Array.from(clients.values()).map(client => client.target));
    }
  }
});
