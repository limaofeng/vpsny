import { IBlueprint, IBundle, IRegion } from '@modules/database/type';
import { md5, metric } from '@utils';
import axios, { AxiosInstance } from 'axios';
import { DigitalOcean } from 'dots-wrapper';
import { IDroplet } from 'dots-wrapper/dist/common/interfaces';

import { Agent, APIKey, Bill, User, Snapshot, Backup } from '../../Agent';
import { Features, Instance, SSHKey } from '../../Provider';
import Message from '../../../../utils/Message';
import moment = require('moment');

const statusMappings: { [key: string]: string } = { new: 'Installing', active: 'Running', off: 'Stopped' };

function getStatus(name: string) {
  const state = statusMappings[name];
  if (state) {
    console.log('DigitalOcean Status -> ', name, state);
    return state;
  }
  const [first, ...leftover] = name.split('');
  const text = first.toUpperCase() + leftover.join('');
  console.log('DigitalOcean Status -> ', name, text);
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
    hostname: data.name,
    publicIP: publicIPV4.ip_address,
    os: data.image.distribution + ' ' + data.image.name,
    ram: {
      size: data.memory
    },
    disk: {
      type: 'SSD',
      size: data.disk
    },
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

export interface DigitalOceanAPIKey extends APIKey {
  token: string;
}

export class DigitalOceanAgent implements Agent {
  id: string;
  apiKey: DigitalOceanAPIKey;
  digitalOcean: DigitalOcean;
  request: AxiosInstance;
  constructor(apiKey: DigitalOceanAPIKey) {
    this.id = md5('digitalOcean:' + apiKey.token, ':');
    this.apiKey = apiKey;
    this.digitalOcean = new DigitalOcean(apiKey.token);

    this.request = axios.create({
      baseURL: 'https://api.digitalocean.com/v2',
      headers: {
        Authorization: `Bearer ${apiKey.token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    metric(this.request);
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
      error => {
        console.warn(error);
        Message.error(error.message);
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
    const sshkey = await this.digitalOcean.SSHKey.update(data.id!, {
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
    track: async (id: string, status: string) => {},
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
      const { doid } = this.parseId(id);
      const { data } = await this.request.post(`/droplets/${doid}/actions`, { type: 'power_off' });
      console.log('instance stop', doid, data);
    },
    start: async (id: string): Promise<void> => {
      try {
        const { doid } = this.parseId(id);
        const action = await this.digitalOcean.Droplet.powerOn(doid).toPromise();
        console.log('instance start', action.id, action.status);
      } catch (e) {
        console.log('DigitalOcean Bug', e);
      }
    },
    restart: async (id: string): Promise<void> => {},
    reboot: async (id: string): Promise<void> => {
      try {
        const { doid } = this.parseId(id);
        const action = await this.digitalOcean.Droplet.reboot(doid).toPromise();
        console.log('instance reboot', action.id, action.status);
      } catch (e) {
        console.log('DigitalOcean Bug', e);
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
  snapshot = {
    list: async (id?: string): Promise<Snapshot[]> => {
      const { doid } = this.parseId(id!);
      const {
        data: { snapshots }
      } = await this.request.get(`/droplets/${doid}/snapshots?per_page=100`);
      return snapshots.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        size: item.size_gigabytes * 1024,
        os: item.distribution,
        regions: item.regions,
        createdAt: moment(item.created_at).toDate()
      }));
    },
    create: async (id: string, name: string): Promise<Snapshot | string> => {
      const { doid } = this.parseId(id!);
      const {
        data: { action }
      } = await this.request.post(`/droplets/${doid}/actions`, {
        type: 'snapshot',
        name
      });
      console.log(action);
      return '';
    },
    restore: async (id: string): Promise<void> => {
      const { doid } = this.parseId(id!);
      const {
        data: { action }
      } = await this.request.post(`/droplets/${doid}/actions`, {
        type: 'restore',
        image: id
      });
      console.log(action);
    },
    delete: async (id: string): Promise<void> => {
      await this.request.delete(`/snapshots/${id}`);
    }
  };
  backup = {
    list: async (id?: string): Promise<Backup[]> => {
      return [];
    }
  };
}
