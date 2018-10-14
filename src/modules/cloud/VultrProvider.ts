import Bluebird from 'bluebird';
import { Provider, Plan, Region, OS, App, SystemImage, SSHKey, Instance, Features, ImageVersion } from './Provider';
import axios from 'axios';
import querystring from 'querystring';
import forge from 'node-forge';
import { Agent, Bill, User, APIKey } from './Agent';
import { format, md5, getPublicKeyFingerprint } from '../../utils';

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

function getStatus(status: string, powerStatus: string, serverState: string) {
  const [first, ...leftover] = powerStatus.split('');
  let text = first.toUpperCase() + leftover.join('');
  if (powerStatus === 'stopped' || powerStatus === 'running') {
    if (['installingbooting', 'isomounting'].some(state => state === serverState)) {
      text = 'Booting';
    } else if (serverState !== 'ok') {
      text = 'Installing';
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
    debugger;
    console.warn('account id is null');
  }
  return {
    id: data.SUBID,
    name: data.label || 'Cloud Instance',
    hostname: mainIp,
    tag: data.tag,
    os: data.os,
    ram: data.ram,
    disk: data.disk,
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
    autoBackups: data.auto_backups !== 'no',
    IPv6: {
      ip: data.v6_main_ip,
      networkSize: parseInt(data.v6_network_size),
      network: data.v6_network,
      networks: data.v6_networks.map((network: any) => ({
        ip: network.v6_main_ip,
        networkSize: parseInt(network.v6_network_size),
        network: network.v6_network
      }))
    },
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

function getImage(type: string, name: string, images: SystemImage[]) {
  const defaultImage = defaultImages.find(
    di => di.type === type && di.name.toLowerCase() === name.toLowerCase()
  ) as SystemImage;
  let image = images.find(i => i.id === defaultImage.id);
  if (!image) {
    image = { ...defaultImage, versions: [] };
    images.push(image);
  }
  return image;
}

export interface VultrAPIKey extends APIKey {
  apiKey: string;
}

export class VultrAgent implements Agent {
  id: string;
  apiKey: string;
  constructor({ apiKey }: VultrAPIKey) {
    this.apiKey = apiKey;
    this.id = apiKey === 'vultr' ? 'vultr' : md5('vultr:' + apiKey, ':');
  }
  options(post: boolean = false) {
    const options: any = {
      headers: {
        'API-Key': this.apiKey
      }
    };
    if (post) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
    }
    return options;
  }

  async regions(): Promise<Region[]> {
    const { data } = await axios.get('https://api.vultr.com/v1/regions/list');
    const regions: Region[] = [];
    for (const id of Object.keys(data)) {
      const region = data[id];
      regions.push({
        id: (region.name as string).toLowerCase(),
        providers: [
          {
            id: id,
            name: 'vultr',
            features: {
              ddosProtection: region.ddos_protection,
              blockStorage: region.block_storage
            }
          }
        ],
        name: region.name,
        state: region.state,
        country: countryNames[region.country.toLowerCase()],
        continent: region.continent,
        availabilityZones: []
      });
    }
    return regions;
  }
  async pricing(): Promise<Plan[]> {
    const {
      all: { data },
      baremetal: { data: baremetal }
    } = await Bluebird.props({
      all: axios.get(`https://api.vultr.com/v1/plans/list?type=all`),
      baremetal: axios.get('https://api.vultr.com/v1/plans/list_baremetal')
    });

    const { data: regions } = await axios.get('https://api.vultr.com/v1/regions/list');

    for (const plan of invisible) {
      data[plan.VPSPLANID] = { ...plan, available_locations: Object.keys(regions).map(region => parseInt(region)) };
    }

    const getType = (type: string): string => {
      switch (type) {
        case 'SSD':
          return 'ssd';
        case 'SATA':
          return 'storage';
        case 'DEDICATED':
          return 'dedicated';
        case 'baremetal':
          return 'baremetal';
        default:
          throw '不支持的 type 类型';
      }
    };

    const convert = (id: number, plan: any): Plan => {
      const vcpu = parseInt(plan.plan_type === 'baremetal' ? plan.cpu_count : plan.vcpu_count); // cpu 核心数
      let disk = 0;
      if (plan.plan_type === 'baremetal') {
        const [left, storage] = plan.disk.split(' ');
        const number = left.replace(/x$/, '');
        disk = parseInt(number) * parseInt(storage);
      } else {
        disk = parseInt(plan.disk);
      }
      return {
        id: String(id), // 服务商ID标示
        provider: 'vultr', // 服务提供商标示
        name: plan.name, // 名称
        isActive: !!plan.available_locations.length,
        vcpu,
        ram: parseInt(plan.ram), // 内存
        disk, // 磁盘大小
        bandwidth: parseFloat(plan.bandwidth) * 1000, // 带宽
        type: getType(plan.plan_type), // 类型： SSD / DEDICATED
        price: parseFloat(plan.price_per_month), // 每月收费 小时费用得自己算
        regions: plan.available_locations // 适用地区
      };
    };

    const plans: Plan[] = [];
    for (const id of Object.keys(data)) {
      const plan = data[id];
      plans.push(convert(parseInt(id), plan));
    }
    for (const id of Object.keys(baremetal)) {
      const plan = baremetal[id];
      plan.plan_type = 'baremetal';
      plans.push(convert(parseInt(id), plan));
    }
    return plans;
  }

  async images(): Promise<SystemImage[]> {
    const images: SystemImage[] = [];

    const { data: oslist } = await axios.get('https://api.vultr.com/v1/os/list');
    for (const vid of Object.keys(oslist)) {
      const version = oslist[vid];
      if (['iso', 'snapshot', 'backup', 'application'].some(val => val === version.family)) {
        continue;
      }
      const image = getImage('os', version.family, images);
      image.versions.push({
        id: parseInt(vid),
        name: version.name
          .replace(image.name, '')
          .replace('(jessie)', '')
          .replace('(stretch)', '')
          .trim(),
        arch: version.arch
      });
    }

    // const { data: applist } = await axios.get('https://api.vultr.com/v1/os/list');
    // for (const vid of Object.keys(applist)) {
    //   const version = applist[vid];

    //   const imageName = version.short_name.includes('pleskonyx') ? 'Plesk Onyx' : version.short_name;
    //   const name = version.deploy_name;
    //   if (imageName === 'Plesk Onyx') {

    //   }

    //   const image = getImage('app', imageName, images);
    //   image.versions.push({
    //     id: parseInt(vid),
    //     name: version.name.replace(image.name, '').replace('(jessie)', '').replace('(stretch)', '').trim(),
    //     arch: version.arch
    //   });
    // }
    return images;
  }

  async deploy(
    hostname: string,
    plan: Plan,
    region: Region,
    image: SystemImage,
    sshkeys: SSHKey[],
    features: Features
  ): Promise<string> {
    console.log(
      querystring.stringify({
        DCID: region.id,
        VPSPLANID: plan.id,
        OSID: (image.version as ImageVersion).id,
        SSHKEYID: sshkeys.map(sshkey => sshkey.id),
        enable_ipv6: features.IPv6 ? 'yes' : 'no',
        enable_private_network: features.PrivateNetwork ? 'yes' : 'no',
        ddos_protection: features.DDOSProtection ? 'yes' : 'no',
        auto_backups: features.AutoBackups ? 'yes' : 'no',
        hostname
      })
    );
    const { data } = await axios.post(
      'https://api.vultr.com/v1/server/create',
      querystring.stringify({
        DCID: region.id,
        VPSPLANID: plan.id,
        OSID: (image.version as ImageVersion).id,
        SSHKEYID: sshkeys.map(sshkey => sshkey.id),
        enable_ipv6: features.IPv6 ? 'yes' : 'no',
        enable_private_network: features.PrivateNetwork ? 'yes' : 'no',
        ddos_protection: features.DDOSProtection ? 'yes' : 'no',
        auto_backups: features.AutoBackups ? 'yes' : 'no',
        hostname
      }),
      this.options(true)
    );
    console.log('server deploy!', data);
    return data.SUBID;
  }

  async user(): Promise<User> {
    const { data }: any = await axios.get('https://api.vultr.com/v1/auth/info', {
      headers: {
        'API-Key': this.apiKey
      }
    });
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
    const { data }: any = await axios.get('https://api.vultr.com/v1/account/info', this.options());
    return {
      balance: Math.abs(parseFloat(data.balance)),
      pendingCharges: parseFloat(data.pending_charges)
    };
  }
  async sshkeys(): Promise<SSHKey[]> {
    const { data }: any = await axios.get('https://api.vultr.com/v1/sshkey/list', {
      headers: {
        'API-Key': this.apiKey
      }
    });
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
    const { data: info }: any = await axios.post(
      'https://api.vultr.com/v1/sshkey/create',
      querystring.stringify({
        name: data.name,
        ssh_key: data.publicKey
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'API-Key': this.apiKey
        }
      }
    );
    console.log('createSSHKey', info);
  }
  async updateSSHKey(data: SSHKey): Promise<void> {
    const { data: info }: any = await axios.post(
      'https://api.vultr.com/v1/sshkey/update',
      querystring.stringify({
        SSHKEYID: data.id,
        name: data.name,
        ssh_key: data.publicKey
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'API-Key': this.apiKey
        }
      }
    );
    console.log('updateSSHKey', info);
  }
  async destroySSHKey(id: string): Promise<void> {
    const { data: info }: any = await axios.post(
      'https://api.vultr.com/v1/sshkey/destroy',
      querystring.stringify({
        SSHKEYID: id
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'API-Key': this.apiKey
        }
      }
    );
    console.log('destroySSHKey', info);
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const { data }: any = await axios.get('https://api.vultr.com/v1/server/list', this.options());
      const list = [];
      for (const id of Object.keys(data)) {
        list.push(parseInstance(this.id as string, data[id]));
      }
      return list;
    },
    get: async (id: string): Promise<Instance> => {
      const { data }: any = await axios.get(
        'https://api.vultr.com/v1/server/list?' +
          querystring.stringify({
            SUBID: id
          }),
        this.options()
      );
      return parseInstance(this.id as string, data);
    },
    stop: async (id: string): Promise<void> => {
      const { data }: any = await axios.post(
        'https://api.vultr.com/v1/server/halt',
        querystring.stringify({
          SUBID: id
        }),
        this.options(true)
      );
      console.log('instance start', data);
    },
    start: async (id: string): Promise<void> => {
      const { data }: any = await axios.post(
        'https://api.vultr.com/v1/server/start',
        querystring.stringify({
          SUBID: id
        }),
        this.options(true)
      );
      console.log('instance start', data);
    },
    restart: async (id: string): Promise<void> => {
      await this.instance.start(id);
    },
    reboot: async (id: string): Promise<void> => {
      const { data }: any = await axios.post(
        'https://api.vultr.com/v1/server/reboot',
        querystring.stringify({
          SUBID: id
        }),
        this.options(true)
      );
      console.log('instance reboot', data);
    },
    destroy: async (id: string): Promise<void> => {
      const { data }: any = await axios.post(
        'https://api.vultr.com/v1/server/destroy',
        querystring.stringify({
          SUBID: id
        }),
        this.options(true)
      );
      console.log('instance destroy', data);
    },
    reinstall: async (id: string): Promise<void> => {
      const { data }: any = await axios.post(
        'https://api.vultr.com/v1/server/reinstall',
        querystring.stringify({
          SUBID: id
        }),
        this.options(true)
      );
      console.log('instance reinstall', data);
    }
  };
}

class VultrProvider implements Provider {
  images: SystemImage[] = [];
  prices: string[] = [];
  products = ['ssd', 'baremetal', 'storage', 'dedicated'];
  id = 'vultr';
  name = 'Vultr';
  url = 'https://www.vultr.com';
  private agent: Agent;
  constructor(agent: Agent) {
    this.agent = agent;
  }

  pricing(region?: string): Plan[] {
    const plans: Plan[] = [];
    return plans;
  }
  regions(plan?: string): Region[] {
    throw new Error('Method not implemented.');
  }
  os(): OS[] {
    throw new Error('Method not implemented.');
  }
  apps(): App[] {
    throw new Error('Method not implemented.');
  }
  getAgent(): Agent {
    return this.agent;
  }
  sshkey(): void {}
}
