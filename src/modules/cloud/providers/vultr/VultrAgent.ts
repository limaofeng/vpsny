import { IBlueprint, IBundle, IRegion } from '@modules/database/type';
import axios, { AxiosInstance } from 'axios';
import Bluebird from 'bluebird';
import querystring from 'querystring';
import firebase, { RNFirebase } from 'react-native-firebase';

import { format, getPublicKeyFingerprint, md5 } from '../../../../utils';
import { Agent, APIKey, Bill, Snapshot, User, Backup } from '../../Agent';
import { Features, Instance, Plan, Region, SSHKey, SystemImage } from '../../Provider';
import Message from '../../../../utils/Message';
import moment = require('moment');

const invisible = [
  {
    VPSPLANID: '199',
    name: '512 MB RAM,20 GB SSD,500 GB BW',
    vcpu_count: '1',
    ram: '512',
    disk: '20',
    bandwidth: '0.5',
    bandwidth_gb: '500',
    price_per_month: '2.5',
    plan_type: 'SSD',
    windows: false,
    note: '',
    available_locations: []
  },
  {
    VPSPLANID: '200',
    name: '512 MB RAM,20 GB SSD,500 GB BW',
    vcpu_count: '1',
    ram: '512',
    disk: '20',
    bandwidth: '0.5',
    bandwidth_gb: '500',
    price_per_month: '3.5',
    plan_type: 'SSD',
    windows: false,
    note: '',
    available_locations: []
  }
];

const countryNames: { [key: string]: string } = {
  au: 'Australia',
  de: 'Germany',
  fr: 'France',
  gb: 'United Kingdom',
  jp: 'Japan',
  nl: 'Netherlands',
  sg: 'Singapore',
  us: 'United States'
};
const defaultImages: SystemImage[] = [
  {
    id: 1,
    type: 'os',
    name: 'CentOS'
  },
  {
    id: 2,
    type: 'os',
    name: 'CoreOS'
  },
  {
    id: 3,
    type: 'os',
    name: 'Debian'
  },
  {
    id: 4,
    type: 'os',
    name: 'Fedora'
  },
  {
    id: 5,
    type: 'os',
    name: 'FreeBSD'
  },
  {
    id: 6,
    type: 'os',
    name: 'OpenBSD'
  },
  {
    id: 7,
    type: 'os',
    name: 'Ubuntu'
  },
  {
    id: 8,
    type: 'os',
    name: 'Windows'
  },
  {
    id: 9,
    type: 'app',
    name: 'cPanel'
  },
  {
    id: 10,
    type: 'app',
    name: 'Docker'
  },
  {
    id: 11,
    type: 'app',
    name: 'Drupal'
  },
  {
    id: 12,
    type: 'app',
    name: 'GitLab'
  },
  {
    id: 13,
    type: 'app',
    name: 'Joomla'
  },
  {
    id: 14,
    type: 'app',
    name: 'LAMP'
  },
  {
    id: 15,
    type: 'app',
    name: 'LEMP'
  },
  {
    id: 16,
    type: 'app',
    name: 'Magento'
  },
  {
    id: 17,
    type: 'app',
    name: 'Mediawiki'
  },
  {
    id: 18,
    type: 'app',
    name: 'Minecraft'
  },
  {
    id: 19,
    type: 'app',
    name: 'Nextcloud'
  },
  {
    id: 20,
    type: 'app',
    name: 'OpenVPN'
  },
  {
    id: 21,
    type: 'app',
    name: 'ownCloud'
  },
  {
    id: 22,
    type: 'app',
    name: 'Plesk Onyx'
  },
  {
    id: 23,
    type: 'app',
    name: 'PrestaShop'
  },
  {
    id: 24,
    type: 'app',
    name: 'Webmin'
  },
  {
    id: 25,
    type: 'app',
    name: 'WordPress'
  }
];

export interface BackupSchedule {
  enabled: boolean;
  cronType: 'daily' | 'weekly' | 'monthly' | 'daily_alt_even' | 'daily_alt_odd';
  nextScheduledTimeUtc: Date;
  hour: number;
  dow: number;
  dom: number;
}

function getStatus(status: string, powerStatus: string, serverState: string) {
  const [first, ...leftover] = powerStatus.split('');
  let text = first.toUpperCase() + leftover.join('');
  if (powerStatus === 'stopped' || powerStatus === 'running') {
    if (['installingbooting', 'isomounting'].some(state => state === serverState)) {
      text = 'Booting';
    } else if (['ok', 'none'].every(s => s !== serverState)) {
      const [first, ...leftover] = serverState.split('');
      text = first.toUpperCase() + leftover.join('');
    } else if (status !== 'active') {
      text = 'Pending';
    }
  } else if (powerStatus === 'starting') {
    text = 'Resizeing';
  }
  return text;
}

function parseInstance(id: string, data: any): Instance {
  // 对应 plan [199, 200 ] 对应 Vultr 2.5, 3.5 的方案
  // TODO: $ 2.5 的付费方案 ipv4 不通
  const mainIp = data.VPSPLANID === '199' ? data.v6_main_ip : data.main_ip;
  if (!id) {
    console.warn('account id is null');
  }
  const IPv6 = data.v6_main_ip
    ? {
        ip: data.v6_main_ip,
        networkSize: parseInt(data.v6_network_size),
        network: data.v6_network,
        networks: data.v6_networks.map((network: any) => ({
          ip: network.v6_main_ip,
          networkSize: parseInt(network.v6_network_size),
          network: network.v6_network
        }))
      }
    : undefined;
  const [ram, unit] = data.ram.split(' ');
  return {
    id: data.SUBID,
    name: data.label || 'Cloud Instance',
    hostname: mainIp,
    publicIP: mainIp,
    tag: data.tag,
    os: data.os,
    ram: {
      size: format.fileSize(parseInt(ram), unit, { mode: 'hide', finalUnit: 'MB' }) as number
    },
    disk: {
      size: parseInt(data.disk.split(' ')[1]),
      type: data.disk.includes('Virtual ') ? 'SSD' : 'HDD'
    },
    vcpu: parseInt(data.vcpu_count),
    location: {
      title: data.location,
      region: data.location
    },
    defaultPassword: data.default_password,
    status: getStatus(data.status, data.power_status, data.server_state),
    state: {
      status: data.status,
      powerStatus: data.power_status,
      serverState: data.server_state
    },
    pendingCharges: parseFloat(data.pending_charges),
    costPerMonth: parseFloat(data.cost_per_month),
    bandwidth: {
      current: parseFloat(data.current_bandwidth_gb),
      allowed: parseFloat(data.allowed_bandwidth_gb)
    },
    internalIP: data.internal_ip,
    kvmUrl: data.kvm_url,
    autoBackups: !(data.auto_backups === 'no' || data.auto_backups === 'disabled'),
    IPv6,
    IPv4: {
      ip: data.main_ip,
      netmask: data.netmask_v4,
      gateway: data.gateway_v4
    },
    firewall: data.FIREWALLGROUPID,
    plan: data.VPSPLANID,
    region: data.DCID,
    image: {
      id: data.APPID !== '0' ? data.APPID : data.OSID,
      type: data.APPID !== '0' ? 'app' : 'os'
    },
    provider: 'vultr',
    account: id,
    createdAt: data.date_created
  };
}

export interface VultrAPIKey extends APIKey {
  apiKey: string;
}

export class VultrAgent implements Agent {
  id: string;
  apiKey: string;
  request: AxiosInstance;
  constructor({ apiKey }: VultrAPIKey) {
    this.apiKey = apiKey;
    this.id = apiKey === 'vultr' ? 'vultr' : md5('vultr:' + apiKey, ':');
    this.request = axios.create({
      baseURL: 'https://api.vultr.com/v1',
      headers: {
        ...(apiKey ? { 'API-Key': apiKey } : {}),
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
    });
    this.request.interceptors.request.use(
      async config => {
        const metric = firebase
          .perf()
          .newHttpMetric(config.baseURL + config.url!, config.method!.toUpperCase() as RNFirebase.perf.HttpMethod);
        await metric.start();
        const store = config as any;
        store.metric = metric;
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    this.request.interceptors.response.use(
      async response => {
        const store = response.config as any;
        const metric: RNFirebase.perf.HttpMetric = store.metric;
        await metric.setHttpResponseCode(response.status);
        await metric.setResponseContentType(response.headers['content-type']);
        await metric.stop();
        return response;
      },
      error => {
        return Promise.reject(error);
      }
    );
    this.request.interceptors.response.use(
      response => {
        const {
          config,
          data: { error, message, additionalErrorInfo }
        } = response;
        if (error && !config.url!.endsWith('errorignore')) {
          console.warn(error, message, additionalErrorInfo);
          Message.error(message + '\r\n' + additionalErrorInfo);
        }
        return response;
      },
      (error, ...args) => {
        console.warn(error.response.data, error.response.config);
        Message.error(error.response.data);
        return Promise.reject(error);
      }
    );
  }
  async deploy(
    hostname: string,
    bundle: IBundle,
    region: IRegion,
    blueprint: IBlueprint,
    sshkeys: SSHKey[],
    features: Features
  ): Promise<string> {
    const body = querystring.stringify({
      DCID: region.id,
      VPSPLANID: bundle.id,
      OSID: blueprint.id,
      SSHKEYID: sshkeys.map(sshkey => sshkey.id),
      enable_ipv6: features.IPv6 ? 'yes' : 'no',
      enable_private_network: features.PrivateNetwork ? 'yes' : 'no',
      ddos_protection: features.DDOSProtection ? 'yes' : 'no',
      auto_backups: features.AutoBackups ? 'yes' : 'no',
      hostname
    });
    console.log(body);
    const { data } = await this.request.post('/server/create', body);
    console.log('server deploy!', data);
    return data.SUBID;
  }

  async user(): Promise<User> {
    const { data }: any = await this.request.get('/auth/info');
    const vultrAPIKey: VultrAPIKey = {
      apiKey: this.apiKey
    };
    return {
      id: this.id,
      apiKey: vultrAPIKey,
      name: data.name,
      email: data.email,
      acls: data.acls
    };
  }
  async bill(): Promise<Bill> {
    const { data }: any = await this.request.get('/account/info');
    return {
      balance: Math.abs(parseFloat(data.balance)),
      pendingCharges: parseFloat(data.pending_charges)
    };
  }
  async sshkeys(): Promise<SSHKey[]> {
    const { data }: any = await this.request.get('/sshkey/list');
    const sshkeys = Object.keys(data).map((id: string) => ({
      id,
      name: data[id].name,
      createdAt: data[id].date_created,
      publicKey: data[id].ssh_key,
      fingerprint: getPublicKeyFingerprint(data[id].ssh_key)
    }));
    return sshkeys;
  }
  async createSSHKey(data: SSHKey): Promise<void> {
    const { data: info }: any = await this.request.post(
      '/sshkey/create',
      querystring.stringify({
        name: data.name,
        ssh_key: data.publicKey
      })
    );
    console.log('createSSHKey', info);
  }
  async updateSSHKey(data: SSHKey): Promise<void> {
    const { data: info }: any = await this.request.post(
      '/sshkey/update',
      querystring.stringify({
        SSHKEYID: data.id,
        name: data.name,
        ssh_key: data.publicKey
      })
    );
    console.log('updateSSHKey', info);
  }
  async destroySSHKey(id: string): Promise<void> {
    const { data: info }: any = await this.request.post(
      '/sshkey/destroy',
      querystring.stringify({
        SSHKEYID: id
      })
    );
    console.log('destroySSHKey', info);
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const { data }: any = await this.request.get('/server/list');
      const list = [];
      for (const id of Object.keys(data)) {
        list.push(parseInstance(this.id as string, data[id]));
      }
      return list;
    },
    get: async (id: string): Promise<Instance> => {
      try {
        const { data }: any = await this.request.get(
          '/server/list?' +
            querystring.stringify({
              SUBID: id
            })
        );
        return parseInstance(this.id as string, data);
      } catch (error) {
        const { response } = error;
        if (response && response.status === 412) {
          console.warn(error);
          error.code = 'NotFoundException';
          throw error;
        }
        throw error;
      }
    },
    stop: async (id: string): Promise<void> => {
      const { data }: any = await this.request.post(
        '/server/halt',
        querystring.stringify({
          SUBID: id
        })
      );
      console.log('instance start', data);
    },
    start: async (id: string): Promise<void> => {
      const { data }: any = await this.request.post(
        '/server/start',
        querystring.stringify({
          SUBID: id
        })
      );
      console.log('instance start', data);
    },
    restart: async (id: string): Promise<void> => {
      await this.instance.start(id);
    },
    reboot: async (id: string): Promise<void> => {
      const { data }: any = await this.request.post(
        '/server/reboot',
        querystring.stringify({
          SUBID: id
        })
      );
      console.log('instance reboot', data);
    },
    destroy: async (id: string): Promise<void> => {
      const { data }: any = await this.request.post(
        '/server/destroy',
        querystring.stringify({
          SUBID: id
        })
      );
      console.log('instance destroy', data);
    },
    reinstall: async (id: string): Promise<void> => {
      const { data }: any = await this.request.post(
        '/server/reinstall',
        querystring.stringify({
          SUBID: id
        })
      );
      console.log('instance reinstall', data);
    },
    enableBackups: async (id: string): Promise<void> => {
      await this.request.post('/server/backup_enable', querystring.stringify({ SUBID: id }));
    },
    disableBackups: async (id: string): Promise<void> => {
      await this.request.post('/server/backup_disable', querystring.stringify({ SUBID: id }));
    },
    restoreBackup: async (id: string, backup: string): Promise<void> => {
      await this.request.post('/server/restore_backup', querystring.stringify({ SUBID: id, BACKUPID: backup }));
    },
    getBackupSchedule: async (id: string): Promise<BackupSchedule> => {
      const { data } = await this.request.post('/server/backup_get_schedule', querystring.stringify({ SUBID: id }));
      return {
        ...data,
        cronType: data.cron_type,
        nextScheduledTimeUtc: data.next_scheduled_time_utc
      };
    },
    setBackupSchedule: async (id: string, { cronType, ...schedule }: BackupSchedule): Promise<void> => {
      await this.request.post(
        '/server/backup_set_schedule',
        querystring.stringify({
          SUBID: id,
          ...schedule,
          cron_type: cronType
        })
      );
    },
    label: async (id: string, value: string) => {
      await this.request.post(
        '/server/label_set',
        querystring.stringify({
          SUBID: id,
          label: value
        })
      );
    },
    tag: async (id: string, value: string) => {
      await this.request.post(
        '/server/tag_set',
        querystring.stringify({
          SUBID: id,
          tag: value
        })
      );
    }
  };
  snapshot = {
    list: async (id?: string): Promise<Snapshot[]> => {
      const { data: snapshots } = await this.request.get('/snapshot/list?' + querystring.stringify({ SUBID: id }));
      return Object.keys(snapshots).map((key: string) => {
        const item: any = snapshots[key];
        const size = format.fileSize(parseInt(item.size), 'bytes', {
          finalUnit: 'MB',
          mode: 'hide'
        }) as number;
        return {
          id: item.SNAPSHOTID,
          name: item.description || `${key}(${format.fileSize(size, 'MB')})`,
          status: item.status,
          size,
          os: item.OSID || item.APPID,
          osid: item.OSID,
          appid: item.APPID,
          createdAt: moment(item.date_created).toDate()
        };
      });
    },
    create: async (id: string, name: string): Promise<Snapshot | string> => {
      const {
        data: { SNAPSHOTID = '' }
      } = await this.request.post('/snapshot/create', querystring.stringify({ SUBID: id, description: name }));
      return SNAPSHOTID;
    },
    delete: async (id: string): Promise<void> => {
      await this.request.post('/snapshot/destroy', querystring.stringify({ SNAPSHOTID: id }));
    },
    restore: async (id: string, snapshot: string): Promise<void> => {
      await this.request.post('/server/restore_snapshot', querystring.stringify({ SUBID: id, SNAPSHOTID: snapshot }));
    }
  };
  backup = {
    list: async (id?: string): Promise<Backup[]> => {
      const { data: backups } = await this.request.get('/backup/list');
      return Object.keys(backups).map(key => {
        const item = backups[key];
        return {
          ...item,
          id: item.id,
          status: item.status,
          name: item.description,
          size: format.fileSize(parseInt(item.size), 'bytes', {
            finalUnit: 'MB',
            mode: 'hide'
          }),
          createdAt: moment(item.date_created).toDate()
        };
      });
    }
  };
}
