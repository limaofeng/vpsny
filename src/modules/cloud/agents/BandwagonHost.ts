import { format, md5 } from '@utils';
import axios from 'axios';
import { Agent, APIKey, Bill, User } from '../Agent';
import { Features, Instance, Plan, Region, SSHKey, SystemImage } from '../Provider';

function parsePlan(data: ISize): Plan {
  const type = 'SSD';
  return {
    id: data.bundleId!, // 服务商ID标示
    isActive: data.isActive!, // 是否可用
    provider: '', // 服务提供商标示
    name: data.name!, // 名称
    vcpu: data.cpuCount!,
    ram: data.ramSizeInGb!, // 内存
    disk: data.diskSizeInGb!, // 磁盘大小
    bandwidth: data.transferPerMonthInGb!, // 带宽
    type, // 类型： SSD / DEDICATED
    price: data.price!, // 每月收费 小时费用得自己算
    regions: [] // 适用地区
  };
}

function parseRegion(data: IRegion): Region {
  return {};
}

const statusMappings: { [key: string]: string } = { new: 'Installing', active: 'Running', off: 'Stopped' };

function getStatus(name: string) {
  const state = statusMappings[name];
  if (state) {
    console.log('BandwagonHost Status -> ', name, state);
    return state;
  }
  const [first, ...leftover] = name.split('');
  const text = first.toUpperCase() + leftover.join('');
  console.log('BandwagonHost Status -> ', name, text);
  return text;
}

function parseInstance(data: IDroplet, account: string): Instance {
  const ipv4s = (data.networks as any).v4;
  const ipv6s = (data.networks as any).v6;
  const publicIPV4 = ipv4s.find((v4: any) => v4.type === 'public');
  const privateIPV4 = ipv4s.find((v4: any) => v4.type === 'private');
  const instance: Instance = {
    id: `droplet:${data.id}`,
    name: data.name,
    status: getStatus(data.status),
    state: {
      status: data.status
    },
    hostname: publicIPV4.ip_address,
    os: data.image.distribution + ' ' + data.image.name,
    ram: format.fileSize(data.memory, 'MB') as string,
    disk: (format.fileSize(data.disk, 'GB') as string) + ' SSD',
    vcpu: data.vcpus,
    location: {
      title: data.region.name,
      availabilityZone: '',
      region: data.region.slug
    },
    pendingCharges: 0,
    costPerMonth: 0,
    bandwidth: {
      current: 0,
      allowed: data.size.transfer
    },
    internalIP: privateIPV4.ip_address,
    networks: {
      IPv4: ipv4s.map((ip: any) => ({
        type: ip.type,
        ip: ip.ip_address,
        netmask: ip.netmask,
        gateway: ip.gateway
      })),
      IPv6: ipv6s.map((ip: any) => ({
        type: ip.type,
        ip: ip.ip_address,
        netmask: ip.netmask,
        gateway: ip.gateway
      }))
    },
    plan: data.size_slug,
    region: data.region.slug,
    image: {
      id: data.image.slug!,
      type: 'os'
    },
    provider: 'digitalocean',
    account,
    createdAt: new Date(data.created_at)
  };
  return instance;
}

export interface BandwagonHostAPIKey extends APIKey {
  token: string;
}

export class BandwagonHostAgent implements Agent {
  id: string;
  apiKey: BandwagonHostAPIKey;
  constructor(apiKey: BandwagonHostAPIKey) {
    this.id = md5('digitalOcean:' + apiKey.token, ':');
    this.apiKey = apiKey;
    this.http = axios.create({
      baseURL: 'https://api.vultr.com',
      headers: {
        ...(apiKey ? { 'API-Key': apiKey } : {}),
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
    });
  }

  async regions(): Promise<Region[]> {
    const pager = await this.digitalOcean.Region.list(0, 100).toPromise();
    return pager.items.map(data => parseRegion(data));
  }
  async pricing(): Promise<Plan[]> {
    const pager = await this.digitalOcean.Size.list(0, 100).toPromise();
    return pager.items.map(data => parsePlan(data));
  }

  async images(): Promise<SystemImage[]> {
    throw 'temporary does not support this operation';
  }

  async deploy(
    hostname: string,
    plan: Plan,
    region: Region,
    image: SystemImage,
    sshkeys: SSHKey[],
    features: Features
  ): Promise<string> {
    throw 'temporary does not support this operation';
  }

  async user(): Promise<User> {
    const account = await this.digitalOcean.Account.get().toPromise();
    return {
      id: this.id,
      apiKey: this.apiKey,
      name: account.email,
      email: account.email,
      uuid: account.uuid
    };
  }
  async bill(): Promise<Bill> {
    return {
      balance: 0,
      pendingCharges: 0
    };
  }
  async sshkeys(): Promise<SSHKey[]> {
    const sshkeys = await this.digitalOcean.SSHKey.list(1, 100).toPromise();
    return sshkeys.items.map(data => ({
      id: data.fingerprint,
      name: data.name,
      fingerprint: data.fingerprint
    })); /*? results.length */
  }
  async createSSHKey(data: SSHKey): Promise<void> {
    const sshkey = await this.digitalOcean.SSHKey.create({
      name: data.name,
      public_key: data.publicKey
    }).toPromise();
    console.log('createSSHKey', sshkey.fingerprint);
  }
  async updateSSHKey(data: SSHKey): Promise<void> {
    const sshkey = await this.digitalOcean.SSHKey.update(data.id, {
      name: data.name,
      public_key: data.publicKey
    }).toPromise();
    console.log('updateSSHKey', sshkey.fingerprint);
  }
  async destroySSHKey(id: string): Promise<void> {
    const sshkey = await this.digitalOcean.SSHKey.delete(id).toPromise();
    console.log('destroySSHKey', id);
  }

  parseId(id: string) {
    const [, doid] = id.split(':');
    return { doid: parseInt(doid) };
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const pager = await this.digitalOcean.Droplet.list(1, 100).toPromise();
      return pager.items.map(data => parseInstance(data, this.id));
    },
    get: async (id: string): Promise<Instance> => {
      try {
        const { doid } = this.parseId(id);
        const data = await this.digitalOcean.Droplet.get(doid).toPromise();
        return parseInstance(data!, this.id!);
      } catch (error) {
        const { response } = error;
        if (response && response.status === 404) {
          console.warn(error);
          error.code = 'NotFoundException';
          throw error;
        }
        throw error;
      }
    },
    stop: async (id: string): Promise<void> => {
      try {
        const { doid } = this.parseId(id);
        const action = await this.digitalOcean.Droplet.powerOff(doid).toPromise();
        console.log('instance stop', action.id, action.status);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    start: async (id: string): Promise<void> => {
      try {
        const { doid } = this.parseId(id);
        const action = await this.digitalOcean.Droplet.powerOn(doid).toPromise();
        console.log('instance start', action.id, action.status);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    restart: async (id: string): Promise<void> => {},
    reboot: async (id: string): Promise<void> => {
      try {
        const { doid } = this.parseId(id);
        const action = await this.digitalOcean.Droplet.reboot(doid).toPromise();
        console.log('instance reboot', action.id, action.status);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    destroy: async (id: string): Promise<void> => {
      const { doid } = this.parseId(id);
      await this.digitalOcean.Droplet.delete(doid).toPromise();
      console.log('instance destroy', doid);
    },
    reinstall: async (id: string): Promise<void> => {
      const { doid } = this.parseId(id);
      const action = await this.digitalOcean.Droplet.powerCycle(doid).toPromise();
      console.log('instance restart', action.id, action.status);
    }
  };
}
