import { md5 } from '@utils';
import Bluebird from 'bluebird';
import axios, { AxiosInstance } from 'axios';
import { Agent, APIKey, Bill, User, Continent, Country } from '../Agent';
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

const DataCenters: {
  [key: string]: {
    name: string;
    continent: Continent;
    country: Country;
    state: string;
    city: string;
  };
} = {
  USCA_9: {
    name: 'Los Angeles, DC9 CN2 GIA',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  USCA_3: {
    name: 'Los Angeles, DC3 CN2',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  USCA_8: {
    name: 'Los Angeles, DC8 CN2',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  USCA_2: {
    name: 'Los Angeles, DC2 QNET',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  USCA_4: {
    name: 'Los Angeles, DC4 MCOM',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  USCA_FMT: {
    name: 'Fremont',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Fremont'
  },
  USNY_2: {
    name: 'New York',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  USNJ: {
    name: 'New Jersey',
    continent: Continent.NA,
    country: Country.us,
    state: 'California',
    city: 'Los Angeles'
  },
  CABC_1: {
    name: 'Vancouver',
    continent: Continent.NA,
    country: Country.ca,
    state: 'British Columbia',
    city: 'Vancouver'
  },
  EUNL_3: {
    name: 'Netherlands',
    continent: Continent.EU,
    country: Country.nl,
    state: '',
    city: ''
  }
};

function parseInstance(data: any, account: string): Instance {
  const datacenter = DataCenters[data.node_location_id];
  let status = getStatus(data.ve_status);
  const vcpu = Number.isInteger(parseInt(data.vcpus)) ? parseInt(data.vcpus) : undefined;
  if (status === 'Running') {
    const started = Number.isInteger(parseInt(data.vcpus));
    status = started ? status : 'Pending';
  }
  const instance: Instance = {
    id: data.veid.toString(),
    name: data.hostname,
    status,
    state: {
      status: data.ve_status,
      suspended: data.suspended
    },
    hostname: data.hostname,
    os: data.os,
    ram: {
      use: data.plan_ram / 1024 / 1024 - data.mem_available_kb / 1024,
      size: data.plan_ram / 1024 / 1024
    },
    swap: {
      use: (data.swap_total_kb - data.swap_available_kb) / 1024,
      size: data.swap_total_kb / 1024
    },
    disk: {
      use: data.ve_used_disk_space_b / 1024 / 1024 / 1024,
      size: data.plan_disk / 1024 / 1024 / 1024,
      type: 'SSD'
    },
    vcpu,
    location: {
      title: datacenter.name,
      continent: datacenter.continent,
      country: datacenter.country,
      state: datacenter.state,
      city: datacenter.city,
      availabilityZone: data.node_location_id,
      region: data.node_location
    },
    bandwidth: {
      current: data.data_counter / 1024 / 1024 / 1024,
      allowed: data.plan_monthly_data / 1024 / 1024 / 1024,
      resets: moment(data.data_next_reset * 1000).format('YYYY-MM-DD')
    },
    publicIP: data.ip_addresses[0],
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

const GetCpuCommand = 'cat /proc/cpuinfo| grep "processor"| wc -l';

export default class BandwagonHostAgent implements Agent {
  id: string;
  apiKey: BandwagonHostAPIKey;
  request: AxiosInstance;
  constructor(apiKey: BandwagonHostAPIKey) {
    this.id = apiKey.id;
    this.apiKey = apiKey;
    this.request = axios.create({
      baseURL: 'https://api.64clouds.com/v1'
    });
  }

  setKey(apiKey: BandwagonHostAPIKey): void {
    this.id = apiKey.id;
    this.apiKey = apiKey;
  }

  deleteVPS(veid: string) {
    this.apiKey.vpses = this.apiKey.vpses.filter(({ veid: id }) => id !== veid);
  }

  async getId(): Promise<string> {
    if (this.id) {
      return this.id;
    }
    const user = await this.user();
    return (user.id = user.id);
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
    const apiKey = this.apiKey.vpses[0];
    if (!apiKey) {
      throw 'apikey is invalid';
    }
    const { data } = await this.request.get(`/getLiveServiceInfo?veid=${apiKey.veid}&api_key=${apiKey.token}`);
    this.apiKey.id = this.id = md5('BandwagonHost:' + data.email, ':');
    return {
      id: this.apiKey.id,
      name: data.email,
      email: data.email,
      apiKey: this.apiKey
    };
  }
  async bill(): Promise<Bill> {
    return {
      balance: 0,
      pendingCharges: 0
    };
  }
  async sshkeys(): Promise<SSHKey[]> {
    return [];
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
  instance = {
    list: async (): Promise<Instance[]> => {
      const list = await Bluebird.all(
        this.apiKey.vpses.map(({ veid, token }) =>
          this.request.get(`/getLiveServiceInfo?veid=${veid}&api_key=${token}`).then(({ data }) => {
            return this.request
              .get(`/basicShell/exec?veid=${veid}&api_key=${token}&command=${GetCpuCommand}`)
              .then(({ data: { message: vcpus } }) => {
                return { ...data, vcpus: vcpus.replace(/\n/g, '') };
              });
          })
        )
      );
      const account = await this.getId();
      return list.map(data => parseInstance(data, account));
    },
    get: async (id: string): Promise<Instance> => {
      try {
        const apiKey = this.apiKey.vpses.find(vps => vps.veid === id.toString())!.token;
        const { data } = await this.request.get(`/getLiveServiceInfo?veid=${id}&api_key=${apiKey}`);
        this.validate(data);
        const account = await this.getId();
        const {
          data: { message: vcpus }
        } = await this.request.get(`/basicShell/exec?veid=${id}&api_key=${apiKey}&command=${GetCpuCommand}`);
        return parseInstance({ ...data, vcpus: vcpus.replace(/\n/g, '') }, account);
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
    stop: async (id: string, force?: boolean): Promise<void> => {
      try {
        const apiKey = this.apiKey.vpses.find(data => data.veid === id)!.token;
        const { data } = await this.request.get(`/${force ? 'kill' : 'stop'}?veid=${id}&api_key=${apiKey}`);
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
    destroy: async (id: string): Promise<void> => {
      throw 'This function is not supported';
    },
    reinstall: async (id: string): Promise<void> => {},
    getAvailableOS: async (id: string): Promise<any> => {
      const apiKey = this.apiKey.vpses.find(data => data.veid === id.toString())!.token;
      const { data } = await this.request.get(`/getAvailableOS?veid=${id}&api_key=${apiKey}`);
      return data;
    }
  };
  validate(result: any) {
    if (result.error !== 0) {
      throw new NetworkError(ERROR_CODES.AGENT_ERROR, result.message, 'api.64clouds.com');
    }
  }
}
