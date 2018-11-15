import { format, md5 } from '@utils';
import Bluebird from 'bluebird';
import axios, { AxiosInstance } from 'axios';
import { Agent, APIKey, Bill, User } from '../Agent';
import { Features, Instance, Plan, Region, SSHKey, SystemImage } from '../Provider';
import NetworkError, { ERROR_CODES } from './NetworkError';
import moment = require('moment');

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

function parseInstance(data: any, account: string): Instance {
  const publicIPV4 = data.ip_addresses[0];
  const instance: Instance = {
    id: data.id,
    name: data.hostname,
    status: getStatus(data.ve_status),
    state: {
      status: data.ve_status,
      suspended: data.suspended
    },
    hostname: publicIPV4.ip_address,
    os: data.os,
    ram: format.fileSize(data.plan_ram, 'KB') as string,
    disk: (format.fileSize(parseInt(data.ve_disk_quota_gb), 'GB') as string) + ' SSD',
    vcpu: data.vcpus,
    location: {
      title: data.node_datacenter,
      availabilityZone: data.node_location_id,
      region: data.node_location
    },
    bandwidth: {
      current: data.data_counter / 1024 / 1024 / 1024,
      allowed: data.plan_monthly_data / 1024 / 1024 / 1024,
      resets: moment(data.data_next_reset * 1000).format('YYYY-MM-DD')
    },
    internalIP: data.node_ip,
    plan: data.plan,
    region: data.node_location_id,
    image: {
      id: data.os,
      type: 'os'
    },
    provider: 'bandwagonhost',
    account,
    liveInfo: {
      ve_status: data.ve_status,
      ve_mac1: data.ve_mac1,
      ve_used_disk_space_b: data.ve_used_disk_space_b,
      ve_disk_quota_gb: data.ve_disk_quota_gb,
      is_cpu_throttled: data.is_cpu_throttled,
      ssh_port: data.ssh_port,
      live_hostname: data.live_hostname,
      load_average: data.load_average,
      mem_available_kb: data.mem_available_kb,
      swap_total_kb: data.swap_total_kb,
      swap_available_kb: data.swap_available_kb
    },
    lastUpdateTime: Date.now()
  };
  return instance;
}

export interface BandwagonHostRestAPI {
  veid: string;
  token: string;
}

export interface BandwagonHostAPIKey extends APIKey {
  id: string;
  vpses: BandwagonHostRestAPI[];
}

export default class BandwagonHostAgent implements Agent {
  id: string;
  apiKey: BandwagonHostAPIKey;
  request: AxiosInstance;
  constructor(apiKey: BandwagonHostAPIKey) {
    this.id = md5('BandwagonHost:' + apiKey.id, ':');
    this.apiKey = apiKey;
    this.request = axios.create({
      baseURL: 'https://api.64clouds.com/v1'
    });
  }

  async regions(): Promise<Region[]> {
    throw 'temporary does not support this operation';
  }
  async pricing(): Promise<Plan[]> {
    throw 'temporary does not support this operation';
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
    throw 'This function is not supported';
  }
  async bill(): Promise<Bill> {
    return {
      balance: 0,
      pendingCharges: 0
    };
  }
  async sshkeys(): Promise<SSHKey[]> {
    throw 'This function is not supported';
  }
  async createSSHKey(data: SSHKey): Promise<void> {
    throw 'This function is not supported';
  }
  async updateSSHKey(data: SSHKey): Promise<void> {
    throw 'This function is not supported';
  }
  async destroySSHKey(id: string): Promise<void> {
    throw 'This function is not supported';
  }

  parseId(id: string) {
    const [, doid] = id.split(':');
    return { doid: parseInt(doid) };
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const list = await Bluebird.all(
        this.apiKey.vpses.map(({ veid, token }) =>
          this.request.get(`/getServiceInfo?veid=${veid}&api_key=${token}`).then(({ data }) => ({ ...data, id: veid }))
        )
      );
      return list.map(data => parseInstance(data, this.id));
    },
    get: async (id: string): Promise<Instance> => {
      try {
        const apiKey = this.apiKey.vpses.find(vps => vps.veid === id)!.token;
        const { data } = await this.request.get(`/getLiveServiceInfo?veid=${id}&api_key=${apiKey}`);
        this.validate(data);
        return parseInstance({ ...data!, id: id }, this.id!);
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
        const apiKey = this.apiKey.vpses.find(data => data.veid === id)!.token;
        const { data } = await this.request.get(`/stop?veid=${id}&api_key=${apiKey}`);
        this.validate(data);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    start: async (id: string): Promise<void> => {
      try {
        const apiKey = this.apiKey.vpses.find(data => data.veid === id)!.token;
        const { data } = await this.request.get(`/start?veid=${id}&api_key=${apiKey}`);
        this.validate(data);
        console.log('instance start', id);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    restart: async (id: string): Promise<void> => {
      try {
        const apiKey = this.apiKey.vpses.find(data => data.veid === id)!.token;
        const { data } = await this.request.get(`/restart?veid=${id}&api_key=${apiKey}`);
        this.validate(data);
        console.log('instance start', id);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    kill: async (id: string): Promise<void> => {
      try {
        const apiKey = this.apiKey.vpses.find(data => data.veid === id)!.token;
        const { data } = await this.request.get(`/kill?veid=${id}&api_key=${apiKey}`);
        this.validate(data);
        console.log('instance start', id);
      } catch (e) {
        console.log('BandwagonHost Bug', e);
      }
    },
    destroy: async (id: string): Promise<void> => {
      throw 'This function is not supported';
    },
    reinstall: async (id: string): Promise<void> => {
      const { doid } = this.parseId(id);
      const action = await this.digitalOcean.Droplet.powerCycle(doid).toPromise();
      console.log('instance restart', action.id, action.status);
    }
  };
  validate(result: any) {
    if (result.error !== 0) {
      throw new NetworkError(ERROR_CODES.AGENT_ERROR, result.message, 'api.64clouds.com');
    }
  }
}
