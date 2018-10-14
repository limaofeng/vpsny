import Bluebird from 'bluebird';
import { isEqual } from 'lodash';
import { Alert } from 'react-native';
import { Answers, Crashlytics } from 'react-native-fabric';
import { AnyAction, Dispatch, Store } from 'redux';
import { Feature, InAction } from 'walkuere-rn';
import { sleep } from '../../utils';
import { SSHConnection } from '../ssh/type';
import { AppState } from './../index';
import { Agent, Bill, User } from './Agent';
import AgentAdapter from './AgentAdapter';
import { AWSAPIKey, AWSLightsailAgent } from './AWSProvider';
import { Plan, SSHKey } from './Provider';
import { Account, Instance, Provider, Region } from './type';
import AccountList from './views/AccountList';
import AccountNew from './views/AccountNew';
import AccountView from './views/AccountView';
import ChooseProvider from './views/ChooseProvider';
import Deploy from './views/Deploy';
import Images from './views/Images';
import Instances from './views/Instances';
import InstanceView from './views/InstanceView';
import Locations from './views/Locations';
import Pricing from './views/Pricing';
import SSHPublicKeys from './views/SSHPublicKeys';
import { VultrAgent, VultrAPIKey } from './VultrProvider';

export const getApi = (key: 'vultr' | 'adapter' | string): Agent => {
  const agent = agents.get(key);
  if (!agent) {
    const handler = {
      get: function(target: any, name: string) {
        const lazy: any = agents.get(key);
        const val = lazy[name];
        return typeof val === 'function' ? val.bind(lazy) : val;
      }
    };
    return new Proxy({}, handler);
  }
  return agent;
};

export const setApi = (key: string, api: Agent) => {
  agents.set(key, api);
};

export const deleteApi = (key: string) => {
  agents.delete(key);
};

const agents = new Map<string, Agent>();

// const configureAgent = (account: Account, type: 'save' | 'update' | 'remove' = 'save'): Agent => {
//   try {
//     if (type === 'save' || type === 'update') {
//       let agent: Agent;
//       switch (account.provider) {
//         case 'vultr':
//           agent = new VultrAgent(account.id, account.apiKey);
//           break;
//         default:
//           throw 'Wrong parameter' + JSON.stringify(account);
//       }
//       agents.set(agent.id(), agent);
//       return agent;
//     } else if (type === 'remove') {
//       const old = agents.get(account.id);
//       agents.delete(account.id);
//       return old as Agent;
//     } else {
//       throw 'Unsupported operation';
//     }
//   } finally {
//     console.log(type, '->', account.id, ' agents ->', Array.from(agents.keys()));
//   }
// };

async function loadAccount(id: string) {
  const api = getApi(id);
  const { user, bill, sshkeys } = await Bluebird.props<{ user: User; bill: Bill; sshkeys: SSHKey[] }>({
    user: api.user(),
    bill: api.bill(),
    sshkeys: api.sshkeys()
  });
  return {
    id: user.id,
    status: 'authorized',
    provider: 'vultr',
    name: user.name,
    email: user.email,
    apiKey: user.apiKey,
    sshkeys,
    bill
  };
}

export const utils = {
  getStatusColor(status: string, colors: any) {
    switch (status) {
      case 'Running':
        return colors.colorful.green;
      case 'Stopped':
        return colors.minor;
      default:
        return colors.colorful.geraldine;
    }
  }
};

export interface CloudState {
  accounts: Account[];
  instances: Instance[];
  providers: Provider[];
  pricing: Plan[];
  regions: Region[];
}

interface AccountAction {
  payload: Account;
}

interface TrackPayload {
  node: Instance;
  timeout: number;
  interval: number;
}

interface AllInstanceAction {
  payload: {
    instances: Instance[];
    uid?: string;
  };
}

export interface InstanceAction extends AnyAction {
  payload: {
    operate: 'delete' | 'update' | 'insert';
    instance: Instance;
  };
}

export default new Feature({
  namespace: 'cloud',
  routes: {
    AccountList,
    AccountNew,
    AccountView,
    ChooseProvider,
    Deploy,
    Images,
    Instances,
    InstanceView,
    Locations,
    Pricing,
    SSHPublicKeys
  },
  state: {
    accounts: [],
    instances: [],
    logs: [],
    providers: [],
    regions: [],
    pricing: []
  },
  reducers: {
    setup(state: any, { payload }: AnyAction) {
      return { ...state, ...payload };
    },
    saveAccount(state: CloudState, { payload }: AnyAction) {
      const { accounts } = state;
      accounts.push({
        id: payload.id,
        status: 'authorized',
        name: payload.name,
        email: payload.email,
        provider: payload.provider,
        apiKey: payload.apiKey,
        sshkeys: [],
        bill: {
          balance: 0,
          pendingCharges: 0
        }
      });
      return { ...state, accounts: [...accounts] };
    },
    updateAccount(state: CloudState, { payload: { id, ...values } }: AnyAction) {
      const { accounts } = state;
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === id) {
          accounts[i] = { ...accounts[i], ...values };
          break;
        }
      }
      return { ...state, accounts: [...accounts] };
    },
    bill(state: CloudState, { payload: { id, bill } }: InAction<Account>) {
      const { accounts } = state;
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === id) {
          accounts[i] = { ...accounts[i], bill };
          break;
        }
      }
      return { ...state, accounts: [...accounts] };
    },
    sshkeys(state: CloudState, { payload: { id, sshkeys } }: InAction<Account>) {
      const { accounts } = state;
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === id) {
          accounts[i] = { ...accounts[i], sshkeys };
          break;
        }
      }
      return { ...state, accounts: [...accounts] };
    },
    deleteAccount(state: CloudState, { payload: { id } }: AnyAction) {
      const { accounts } = state;
      return { ...state, accounts: accounts.filter(a => a.id !== id) };
    },
    images({ providers, ...state }: CloudState, { payload: { pid, images } }: AnyAction) {
      for (let i = 0; i < providers.length; i++) {
        if (providers[i].id === pid) {
          providers[i] = { ...providers[i], images };
          break;
        }
      }
      return { ...state, providers: [...providers] };
    },
    regions(state: CloudState, { payload: regions }: AnyAction) {
      return { ...state, regions };
    },
    pricing(state: CloudState, { payload: plans }: AnyAction) {
      return { ...state, pricing: plans };
    },
    saveInstance({ instances, ...state }: CloudState, { payload: { operate, instance } }: InstanceAction) {
      if (operate === 'delete') {
        return { ...state, instances: instances.filter(node => node.id !== instance.id) };
      } else if (operate === 'update') {
        return {
          ...state,
          instances: instances.map(node => (node.id === instance.id ? { ...node, ...instance } : node))
        };
      } else if (operate === 'insert') {
        return {
          ...state,
          instances: [...instances, instance]
        };
      }
    }
  },
  effects: {
    *track(
      { payload: { node: instance, timeout = 120, interval = 3 } }: InAction<TrackPayload>,
      { put, call, select }: any
    ) {
      const { id, account } = instance;
      try {
        const api = getApi(account);
        let previous: Instance = instance;
        let times = 0;
        do {
          const node = yield call(api.instance.get, id);
          if (node === null) {
            break;
          }
          const status = node.status; // utils.getStatusText(node);
          if (!isEqual(previous, node)) {
            times = 1;
            previous = node;
            yield put({ type: 'instance', payload: { operate: 'update', instance: node } });
          } else {
            times++;
          }
          console.log(`tracking node=${id} status=${status} times=${times}`);
          if ((status === 'Running' || status === 'Stopped') && times === 2) {
            console.log('state confirm -> ', status);
            break;
          }
          // 超时设置 times 120次 大概 10 分钟
          if (times === timeout) {
            console.warn(`tracking node=${id} status=${status} timeout`, 'details', {
              status: node.status,
              serverState: node.serverState,
              powerStatus: node.powerStatus
            });
            break;
          }
          // 睡 3 秒
          yield call(sleep, interval * 1000);
        } while (true);
      } catch (error) {
        const { response } = error;
        if (response && response.status === 412) {
          yield put({ type: 'instance', payload: { operate: 'delete', instance: { id } } });
        }
        console.warn(error);
        Crashlytics.log(error.message);
      }
    },
    *instances({ payload: { uid, instances } }: AllInstanceAction, { put, select }: any) {
      const originalInstances: Instance[] = yield select(
        ({ cloud: { instances } }: any) =>
          uid ? instances.filter((instance: Instance) => instance.account === uid) : [...instances]
      );
      for (const node of instances) {
        const index = originalInstances.findIndex(original => original.id === node.id);
        if (index == -1) {
          // 新增
          yield put({ type: 'instance', payload: { operate: 'insert', instance: node } });
        } else {
          // 修改
          yield put({ type: 'instance', payload: { operate: 'update', instance: node } });
          originalInstances.splice(index, 1);
        }
      }
      // 删除已经不存在的节点
      for (const node of originalInstances) {
        yield put({ type: 'instance', payload: { operate: 'delete', instance: node } });
      }
    },
    *instance({ payload: { instance, operate } }: InstanceAction, { put, select }: any) {
      const originalInstance: Instance = yield select(({ cloud: { instances } }: any) =>
        instances.find((node: Instance) => node.id === instance.id)
      );
      // 保存到 Account 中
      yield put({ type: 'saveInstance', payload: { operate, instance } });
      // 检查 SSHConnection
      if (operate === 'delete') {
        yield put({ type: 'ssh/deleteConnection', payload: { id: instance.id } });
      } else if (operate === 'insert') {
        const connection: SSHConnection = {
          id: instance.id,
          status: 'unauthorized',
          hostname: instance.hostname,
          port: 22,
          username: 'root',
          password: instance.defaultPassword
        };
        yield put({ type: 'ssh/connection', payload: connection });
      } else {
        const originalConnection: SSHConnection = yield select(({ ssh: { connections } }: any) =>
          connections.find((con: SSHConnection) => con.id === instance.id)
        );
        if (
          originalConnection.hostname != instance.hostname || // 更换 IP 后需要更新 SSHConnection
          (originalInstance.defaultPassword === originalConnection.password &&
            originalConnection.password !== instance.defaultPassword) // 如果之前的密码为 默认密码后 需要更新 SSHConnection
        ) {
          const connection: SSHConnection = {
            id: instance.id,
            hostname: instance.hostname,
            port: 22,
            username: 'root',
            password: instance.defaultPassword
          };
          yield put({ type: 'ssh/connection', payload: connection });
        }
      }
    },

    *refreshAccount({ payload: { id } }: InAction<Account>, { put, call }: any) {
      try {
        yield put({ type: 'updateAccount', payload: { id, status: 'refreshing' } });
        const account: Account = yield call(loadAccount, id);
        yield put({ type: 'updateAccount', payload: { ...account, id } });
      } catch ({ response }) {
        if (response) {
          if (response.status === 403) {
            Alert.alert(
              'Invalid API key',
              'APIKEY 已经失效',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
              { cancelable: false }
            );
          }
        }
      }
    },
    *addAccount({ payload }: InAction<Account>, { put, call }: any) {
      yield put({ type: 'saveAccount', payload: { ...payload } });
      Answers.logContentView('Account Save', 'Account', payload.id, {
        provider: payload.provider,
        email: payload.email!
      });
    },
    *updateAccountApiKey({ payload }: InAction<Account>, { put, call }: any) {
      const { apiKey, id } = payload;
      yield put({ type: 'updateAccount', payload: { apiKey, id } });
      yield put({ type: 'refreshAccount', payload: { apiKey, id } });
      // const instances = yield call(api.instance.list);
      // yield put({ type: 'instances', payload: { instances } });
    },
    *dropAccount({ payload }: InAction<Account>, { put, select }: any) {
      const {
        nodes,
        account
      }: {
        nodes: Instance[];
        account: Account;
      } = yield select(({ cloud: { instances, accounts } }: AppState) => ({
        nodes: instances.filter(instance => instance.account === payload.id),
        account: accounts.find(acc => acc.id === payload.id)
      }));
      for (const node of nodes) {
        yield put({ type: 'instance', payload: { operate: 'delete', instance: node } });
      }
      yield put({ type: 'deleteAccount', payload: account });
      deleteApi(account.id);
    }
  },
  subscriptions: {
    async initAgents({ state, store }: { state: CloudState; store: Store }) {
      const { accounts } = state;
      // 加载适配器
      const adapter = new AgentAdapter(agents, finder => finder(store.getState()));
      agents.set(adapter.id, adapter);
      // 加载 Account 对应的 Agent
      for (const account of accounts) {
        let api: Agent | undefined;
        if (account.provider === 'vultr') {
          api = new VultrAgent(account.apiKey as VultrAPIKey);
        } else if (account.provider === 'lightsail') {
          api = new AWSLightsailAgent(account.apiKey as AWSAPIKey);
        } else {
          console.warn('Wrong parameter' + JSON.stringify(account));
        }
        if (api) {
          setApi(api.id, api);
        }
      }
      console.log('setup agents ->', Array.from(agents.keys()));
    },
    async tracking({ dispatch, state }: { dispatch: Dispatch; state: CloudState }) {
      const { instances } = state;
      for (const node of instances) {
        const status = node.status; // utils.getStatusText(node);
        if (status === 'Running' || status === 'Stopped') {
          continue;
        }
        dispatch({ type: 'track', payload: node });
      }
    }
    // async syncWithVultr({ dispatch, state }: { dispatch: Dispatch; state: CloudState }) {
    //   const agent = vultr.getAgent();
    //   const pricing = await agent.pricing();
    //   const regions = await agent.regions();
    //   const images = await agent.images();
    //   const { id, name, products } = vultr;

    //   const prices: any[] = [];
    //   for (const plan of pricing) {
    //     if (!prices.includes(plan.price)) {
    //       prices.push(plan.price);
    //     }
    //   }

    //   dispatch({ type: 'setup', payload: { pricing, regions, providers: [{ id, name, products, prices, images }] } });
    // }
  }
});
