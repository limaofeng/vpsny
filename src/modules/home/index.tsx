import React from 'react';
import { createStackNavigator } from 'react-navigation';
import Bluebird from 'bluebird';
import { Feature } from 'walkuere-rn';
import querystring from 'querystring';

import axios from 'axios';

import { uuid, sleep, format } from '../../utils';
import Servers from './views/Servers';
import BindHost from './views/ServerNew';
import ServerEdit from './views/ServerEdit';
import { KeyPair } from '../cloud/type';

import { createServer } from 'http2';

interface Metrics {
  uptime: string;
  cpu: number;
  memory: {
    usage: number;
    percentage: number;
  };
  disk: {
    usage: number;
    percentage: number;
  };
  net: {
    usage: number;
    percentage: number;
  };
}

export interface Host {
  id: string;
  status: 'connecting' | 'refreshing' | 'Connected' | 'NotConnected' | 'Disconnected';
  /**
   * 名称
   */
  name: string;
  /**
   * 云服务商
   */
  provider?: string;
  /**
   * IP 地址
   */
  ip: string;
  /**
   * 端口
   */
  port: number;
  /**
   * 登陆用户名
   */
  username: string;
  /**
   * 登陆密码
   */
  password: string;
  /**
   * SSH Key
   */
  sshkey: string;
  /**
   * 系统信息
   */
  os?: string;
  /**
   * 内存
   */
  ram?: string;
  /**
   * CPU
   */
  vcpu?: number;
  /**
   * 存储
   */
  disk?: string;
  /**
   * 类型 ?? 什么东西
   */
  type?: string;
  /**
   * 位置及地理信息
   */
  location?: string;
  /**
   * 指标
   */
  metrics: Metrics;
}

interface ServerAction {
  payload: Host;
}

import { View, Button, Text } from 'react-native';
import { getSSHClient } from '../ssh';
import { SSHClient } from '../ssh/SSHClient';

export default new Feature({
  routes: {
    Servers,
    BindHost,
    ServerEdit,
  },
  namespace: 'server',
  state: {
    hosts: []
  },
  reducers: {
    addServer(state: any, { payload: host }: any) {
      const { hosts } = state;
      host.name = host.name || 'My Server';
      host.port = host.port || 22;
      if (!!host.id) {
        hosts.push({ ...host, metrics: {} });
      } else {
        console.warn(host, 'id is null');
      }
      return { ...state, hosts: [...hosts] };
    },
    updateServer(state: any, { payload: { metrics, ...host } }: any) {
      const { hosts } = state;
      for (let i = 0; i < hosts.length; i++) {
        if (hosts[i].id === host.id) {
          hosts[i] = { ...hosts[i], ...host, metrics: { ...hosts[i].metrics, ...metrics } };
        }
      }
      return { ...state, hosts: [...hosts] };
    },
    removeServer(state: any, { payload: { id } }: any) {
      const { hosts } = state;
      return { ...state, hosts: [...hosts.filter((h: any) => h.id !== id)] };
    }
  },
  effects: {
    *refresh({ payload }: any, { put, select }: any) {
      const hosts = yield select(({ server: { hosts } }: any) => hosts);
      for (const host of hosts) {
        yield put({ type: 'refreshServer', payload: { id: host.id } });
      }
    },
    *refreshServer({ payload: { id } }: any, { put, select, take, call }: any) {
      const host: Host = yield select(({ server: { hosts } }: any) => hosts.find((h: Host) => h.id === id));
      const keyPairs: KeyPair[] = yield select(({ settings: { keyPairs } }: any) => keyPairs);
      const keyPair = keyPairs.find(key => key.id === host.sshkey) as KeyPair;

      try {
        yield put({ type: 'updateServer', payload: { id: host.id, status: 'connecting' } });
        // 获取连接
        const client: SSHClient = getSSHClient(host.id);
        yield put({ type: 'updateServer', payload: { id: host.id, status: 'refreshing' } });
        // 查询运行时间
        const uptime = yield call(async () => {
          return getUptime(client);
        });
        // CPU 使用率
        yield put({ type: 'updateServer', payload: { id: host.id, metrics: { uptime } } });
        const cpu = yield call(async () => {
          const firstSample = await getCpuTime(client);
          await sleep(1000);
          const secondSample = await getCpuTime(client);
          const total = secondSample.totalCpuTime - firstSample.totalCpuTime;
          const idle = secondSample.idle - firstSample.idle;
          const usage = (100 * (total - idle)) / total;
          return usage;
        });
        yield put({ type: 'updateServer', payload: { id: host.id, metrics: { cpu } } });
        // 内存使用
        const memory = yield call(async () => {
          const data = await getMemory(client);
          return data;
        });
        yield put({ type: 'updateServer', payload: { id: host.id, metrics: { memory } } });
        // 磁盘空间
        const disk = yield call(async () => {
          const data = await getDisk(client);
          return data;
        });
        yield put({ type: 'updateServer', payload: { id: host.id, metrics: { disk } } });
        // 网络消耗
        const net = yield call(async () => {
          const data = await getNet(client);
          return data;
        });
        yield put({ type: 'updateServer', payload: { id: host.id, metrics: { net } } });
        // 修改状态
        yield put({ type: 'updateServer', payload: { id: host.id, status: 'Connected' } });
      } catch (err) {
        console.log(err);
        yield put({ type: 'updateServer', payload: { id: host.id, status: 'NotConnected' } });
      }
      // const action1 = yield put({
      //   type: 'terminal/connection',
      //   payload: {
      //     address: host.ip,
      //     port: host.port,
      // credential: {
      //   type: 'ssh',
      //   username: host.username,
      //   privateKey: keyPair && keyPair.privateKey,
      //   publicKey: keyPair && keyPair.publicKey,
      //   passphrase: keyPair && keyPair.passphrase
      // }
      //   }
      // });
      // const key = host.username + '@' + host.ip + ':' + host.port;
      // const action = yield take(`terminal/connection/${key}`);
      // console.log('123123123', action);
    },
    *createServer({ payload: host }: ServerAction, { put, select }: any) {
      const id = uuid();
      yield put({ type: 'addServer', payload: { ...host, id } });
      yield put({ type: 'refreshServer', payload: { id } });
    }
  },
  subscriptions: {
    async setup({ dispatch }: any) {}
  }
});

// 获取运行时间
const getUptime = async (client: SSHClient): Promise<number> => {
  const output = await client.execute('cat /proc/uptime');
  // 406596.04 748772.35
  const uptime = parseInt(output.split(',')[0]);
  return Math.floor(uptime / 60 / 60 / 24); // 秒 -> 天
};

// 查询 CPU 信息
const getCpuTime = async (client: SSHClient): Promise<{ totalCpuTime: number; idle: number }> => {
  const output = await client.execute("cat /proc/stat|grep 'cpu '");
  // cpu  3041966 0 3071652 74537660 324282 0 17127 0 0 0
  const [user, nice, system, idle, iowait, irq, softirq, stealstolen, guest, guest_nice] = output
    .split('  ')[1]
    .split(' ')
    .map(item => parseInt(item));
  return {
    totalCpuTime: user + nice + system + idle + iowait + irq + softirq + stealstolen + guest + guest_nice,
    idle
  };
};

const getMemory = async (
  client: SSHClient
): Promise<{
  usage: number;
  percentage: number;
}> => {
  const output = await client.execute('cat /proc/meminfo');
  const data: any = {};
  output
    .split('\n')
    .filter(line => !!line.trim())
    .forEach(line => {
      const [key, value] = line.split(':');
      data[key] = parseInt(value.trim().replace(/ kB$/, ''));
    });
  const totalUsedMemory = data['MemTotal'] - data['MemFree'];
  const cachedMemory = data['Cached'] + data['SReclaimable'] - data['Shmem'];
  const nonCacheOrBuffer = totalUsedMemory - (data['Buffers'] + cachedMemory);
  return {
    usage: parseFloat(format.number(nonCacheOrBuffer / 1024, '0.0')),
    percentage: (nonCacheOrBuffer / data['MemTotal']) * 100
  };
};

const getDisk = async (
  client: SSHClient
): Promise<{
  usage: number;
  percentage: number;
}> => {
  const output = await client.execute('df -P -BG | grep /dev');
  const data = output
    .split('\n')
    .filter(line => line.startsWith('/'))
    .map(line => {
      const [fs, blocks, used, available, use] = line.split(' ').filter(item => !!item.trim());
      return { fs, blocks: parseInt(blocks), used: parseInt(used), available, use: parseFloat(use) / 100 };
    });
  const total = data.map(item => item.blocks).reduce((l, r) => {
    return l + r;
  });
  const used = data.map(item => item.blocks * item.use).reduce((l, r) => {
    return l + r;
  });
  return {
    usage: parseFloat(format.number(used, '0.0')),
    percentage: (used / total) * 100
  };
};

const getNet = async (
  client: SSHClient
): Promise<{
  usage: number;
  percentage: number;
}> => {
  const output = await client.execute("cat /proc/net/dev | grep 'eth0'");
  const out = parseInt(output.split(' ').filter(item => !!item)[9]) / 1000 / 1000; // 转为 MB
  const sections = [1000 * 5, 1000 * 10, 1000 * 30, 1000 * 100];
  let percentage = 0;
  for (const section of sections) {
    if (out < section) {
      percentage = out / section;
      break;
    }
  }
  return {
    usage: parseFloat(format.number(out, '0.0')),
    percentage: percentage * 100
  };
};
