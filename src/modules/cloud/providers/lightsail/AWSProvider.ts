import { format, md5 } from '@utils';
import { IAM, Lightsail } from 'aws-sdk/dist/aws-sdk-react-native';
import axios from 'axios';
import querystring from 'querystring';

import { Agent, APIKey, Bill, Continent, Country, User, Snapshot } from '../../Agent';
import {
  Features,
  ImageVersion,
  Instance,
  InstanceNetworking,
  Plan,
  Region,
  SSHKey,
  SystemImage
} from '../../Provider';
import { OperationList } from 'aws-sdk/clients/lightsail';

export const AWSRegions: {
  [key: string]: {
    name: string;
    continent: Continent;
    country: Country;
    state: string;
  };
} = {
  'us-east-1': {
    name: 'US East (N. Virginia)',
    continent: Continent.NA,
    country: Country.us,
    state: 'N. Virginia'
  },
  'us-east-2': {
    name: 'US East (Ohio)',
    continent: Continent.NA,
    country: Country.us,
    state: 'Ohio'
  },
  'us-west-1': {
    name: 'US West (N. California)',
    continent: Continent.NA,
    country: Country.us,
    state: 'N. California'
  },
  'us-west-2': {
    name: 'US West (Oregon)',
    continent: Continent.NA,
    country: Country.us,
    state: 'Oregon'
  },
  'ca-central-1': {
    name: 'Canada (Central)',
    continent: Continent.NA,
    country: Country.ca,
    state: 'Central' // Montreal
  },
  'eu-central-1': {
    name: 'EU (Frankfurt)',
    continent: Continent.EU,
    country: Country.de,
    state: 'Frankfurt'
  },
  'eu-west-1': {
    name: 'EU (Ireland)',
    continent: Continent.EU,
    country: Country.ie,
    state: 'Ireland'
  },
  'eu-west-2': {
    name: 'EU (London)',
    continent: Continent.EU,
    country: Country.gb,
    state: 'London'
  },
  'eu-west-3': {
    name: 'EU (Paris)',
    continent: Continent.EU,
    country: Country.fr,
    state: 'Paris'
  },
  'ap-northeast-1': {
    name: 'Asia Pacific (Tokyo)',
    continent: Continent.AS,
    country: Country.jp,
    state: 'Tokyo'
  },
  'ap-northeast-2': {
    name: 'Asia Pacific (Seoul)',
    continent: Continent.AS,
    country: Country.kr,
    state: 'Seoul'
  },
  'ap-northeast-3': {
    name: 'Asia Pacific (Osaka-Local)',
    continent: Continent.AS,
    country: Country.jp,
    state: 'Osaka'
  },
  'ap-southeast-1': {
    name: 'Asia Pacific (Singapore)',
    continent: Continent.AS,
    country: Country.sg,
    state: 'Singapore'
  },
  'ap-southeast-2': {
    name: 'Asia Pacific (Sydney)',
    continent: Continent.OA,
    country: Country.au,
    state: 'Sydney'
  },
  'ap-south-1': {
    name: 'Asia Pacific (Mumbai)',
    continent: Continent.AS,
    country: Country.in,
    state: 'Mumbai'
  },
  'sa-east-1': {
    name: 'South America (São Paulo)',
    continent: Continent.SA,
    country: Country.br,
    state: 'São Paulo'
  }
};

function parseRegion(data: Lightsail.Region): Region {
  const location = AWSRegions[data.name!];
  return {
    id: data.displayName!.toLowerCase(),
    providers: [
      {
        id: data.name!,
        type: 'lightsail',
        availabilityZones: data.availabilityZones!.map(data => ({
          state: data.state!,
          zoneName: data.zoneName!
        })),
        ...location
      }
    ],
    name: data.displayName!,
    state: location.state,
    country: location.country,
    continent: location.continent
  };
}

function parsePlan(data: Lightsail.Bundle): Plan {
  const type = 'SSD';
  return {
    id: data.bundleId!, // 服务商ID标示
    isActive: data.isActive!, // 是否可用
    provider: 'lightsail', // 服务提供商标示
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

const defaultImages: SystemImage[] = [];

function getStatus(name: string) {
  const [first, ...leftover] = name.split('');
  const text = first.toUpperCase() + leftover.join('');
  console.log('AWS Status -> ', name, text);
  return text;
}

function parseInstance(data: Lightsail.Instance, account: string): Instance {
  const datacenter = AWSRegions[data.location!.regionName!];
  const instance: Instance = {
    id: `${data.location!.regionName}:${data.name}`,
    name: data.name!,
    status: getStatus(data.state!.name!),
    state: {
      code: data.state!.code,
      status: data.state!.name!
    },
    hostname: data.publicIpAddress!,
    publicIP: data.publicIpAddress!,
    os: data.blueprintName!,
    ram: {
      size: data.hardware!.ramSizeInGb! * 1024
    },
    disk: {
      size: data.hardware!.disks![0].sizeInGb!,
      type: 'SSD'
    },
    vcpu: data.hardware!.cpuCount!,
    disks: data.hardware!.disks!.map(data => ({
      name: data.name!,
      isSystemDisk: data.isSystemDisk!,
      attachedTo: data.attachedTo!,
      iops: data.iops!,
      path: data.path!,
      attachmentState: data.attachmentState!,
      isAttached: data.isAttached!,
      use: data.gbInUse!,
      size: data.sizeInGb!,
      createdAt: data.createdAt!
    })),
    location: {
      title: datacenter.name,
      continent: datacenter.continent,
      country: datacenter.country,
      state: datacenter.state,
      availabilityZone: data.location!.availabilityZone!,
      region: data.location!.regionName!
    },
    pendingCharges: 0,
    costPerMonth: 0,
    bandwidth: {
      current: 0,
      allowed: data.networking!.monthlyTransfer!.gbPerMonthAllocated!
    },
    internalIP: data.privateIpAddress!,
    plan: data.bundleId!,
    region: data.location!.regionName!,
    image: {
      id: data.blueprintId!,
      type: 'os'
    },
    provider: 'lightsail',
    account,
    createdAt: data.createdAt!
  };
  if (data.networking) {
    const networking: InstanceNetworking = {
      privateIpAddress: data.privateIpAddress!,
      publicIpAddress: data.publicIpAddress!,
      isStaticIp: data.isStaticIp!,
      firewall: data.networking.ports!.map(port => ({
        fromPort: port.fromPort!,
        toPort: port.toPort!,
        protocol: port.protocol!,
        accessFrom: port.accessFrom!,
        accessType: port.accessType!,
        commonName: port.commonName!,
        accessDirection: port.accessDirection!
      }))
    };
    instance.networking = networking;
  }
  return instance;
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

export interface AWSAPIKey extends APIKey {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AWSOptions {
  defaultRegion: string;
  regions: string[];
}

export class AWSLightsailAgent implements Agent {
  id: string;
  apiKey: AWSAPIKey;
  options: AWSOptions;
  alllightsails: Map<string, Lightsail> = new Map();
  lightsail: Lightsail;
  iam: IAM;
  constructor(apiKey: AWSAPIKey, options: AWSOptions) {
    this.options = options;
    this.id = md5(apiKey.accessKeyId + ':' + apiKey.secretAccessKey, ':');
    this.apiKey = apiKey;
    this.lightsail = new Lightsail({
      region: options.defaultRegion,
      ...this.apiKey
    });
    this.iam = new IAM({
      region: options.defaultRegion,
      ...this.apiKey
    });
    this.setQueryRegions(options.regions);
  }

  setDefaultRegion(defaultRegion: string): void {
    this.lightsail = new Lightsail({
      region: defaultRegion,
      ...this.apiKey
    });
    this.options.defaultRegion = defaultRegion;
    this.setQueryRegions(this.options.regions);
  }

  setQueryRegions = (regions: string[]) => {
    this.alllightsails.clear();
    this.alllightsails.set(this.options.defaultRegion, this.lightsail);
    for (const region of regions.filter(region => region !== this.options.defaultRegion)) {
      this.alllightsails.set(
        region,
        new Lightsail({
          region,
          ...this.apiKey
        })
      );
    }
    this.options.regions = regions;
  };

  async regions(): Promise<Region[]> {
    const start = Date.now();
    const lightsails = Array.from(this.alllightsails.values());

    const resps = await Promise.all(
      lightsails.map(lightsail => lightsail.getRegions({ includeAvailabilityZones: true }).promise())
    );

    const results = new Map<string, Lightsail.Region>();
    for (const { regions } of resps) {
      for (const region of regions!) {
        if (region.availabilityZones!.length) {
          results.set(region.name!, region);
        } else if (!results.has(region.name!)) {
          results.set(region.name!, region);
        }
      }
    }
    console.log('query regions -> ', (Date.now() - start) / 1000);
    return Array.from(results.values()).map(data => parseRegion(data));
  }
  async pricing(): Promise<Plan[]> {
    const { bundles = [] } = await this.lightsail.getBundles().promise();
    const plans = bundles.filter(data => (data.supportedPlatforms || []).some(platform => platform === 'LINUX_UNIX'));
    return plans.map(data => parsePlan(data));
  }

  async images(): Promise<SystemImage[]> {
    const images: SystemImage[] = [];
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
      })
    );
    console.log('server deploy!', data);
    return data.SUBID;
  }

  async user(): Promise<User> {
    const { User: user } = await this.iam.getUser().promise();
    return {
      id: this.id,
      apiKey: this.apiKey,
      name: user.UserName,
      email: ''
    };
  }
  async bill(): Promise<Bill> {
    return {
      balance: 0,
      pendingCharges: 0
    };
  }
  async sshkeys(): Promise<SSHKey[]> {
    const lightsails = Array.from(this.alllightsails.values());
    const resps = await Promise.all(lightsails.map(lightsail => lightsail.getKeyPairs().promise()));
    const results = [];
    for (const { keyPairs } of resps) {
      results.push(...keyPairs);
    }
    return results.map(data => ({
      id: md5(data.arn!),
      name: data.name!,
      createdAt: data.createdAt as Date,
      fingerprint: data.fingerprint!,
      location: {
        availabilityZone: (data.location && data.location.availabilityZone!) || '',
        region: (data.location && data.location.regionName!) || ''
      }
    })); /*? results.length */
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

  async getlightsail(region: string): Promise<Lightsail> {
    return this.alllightsails.get(region)!;
  }
  parseId(id: string) {
    const [region, instanceName] = id.split(':');
    return { region, instanceName };
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const lightsails = Array.from(this.alllightsails.values());
      const resps = await Promise.all(lightsails.map(lightsail => lightsail.getInstances().promise()));
      const results = [];
      for (const { instances } of resps) {
        results.push(...instances);
      }
      return results.map(data => parseInstance(data, this.id));
    },
    get: async (id: string): Promise<Instance> => {
      const { region, instanceName } = this.parseId(id);
      const lightsail = await this.getlightsail(region);
      const { instance } = await lightsail
        .getInstance({
          instanceName
        })
        .promise();
      return parseInstance(instance!, this.id!);
    },
    stop: async (id: string): Promise<void> => {
      const { region, instanceName } = this.parseId(id);
      const lightsail = await this.getlightsail(region);
      const { operations } = await lightsail
        .stopInstance({
          instanceName
        })
        .promise(); /*? $ */
      console.log('instance stop', operations![0].id);
    },
    start: async (id: string): Promise<void> => {
      const { region, instanceName } = this.parseId(id);
      const lightsail = await this.getlightsail(region);
      const { operations } = await lightsail
        .startInstance({
          instanceName
        })
        .promise();
      console.log('instance start', operations![0].id);
    },
    restart: async (id: string): Promise<void> => {
      await this.instance.start(id);
    },
    reboot: async (id: string): Promise<void> => {
      const { region, instanceName } = this.parseId(id);
      const lightsail = await this.getlightsail(region);
      const { operations } = await lightsail
        .rebootInstance({
          instanceName
        })
        .promise(); /*? $ */
      console.log('instance reboot', operations![0].id);
    },
    destroy: async (id: string): Promise<void> => {
      const { region, instanceName } = this.parseId(id);
      const lightsail = await this.getlightsail(region);
      const { operations } = await lightsail
        .deleteInstance({
          instanceName
        })
        .promise(); /*? $ */
      console.log('instance destroy', operations![0].id);
    },
    history: async (id: string): Promise<OperationList> => {
      const { region, instanceName } = this.parseId(id);
      const lightsail = await this.getlightsail(region);
      const { operations } = await lightsail
        .getOperationsForResource({
          resourceName: instanceName
        })
        .promise();
      return operations!;
    },
    reinstall: async (id: string): Promise<void> => {
      throw new Error(`AWS Lightsail(${id}) does not support \`reinstall\` operation`);
    }
  };
  snapshot = {
    list: async (): Promise<Snapshot[]> => {
      const lightsail = await this.getlightsail(this.options.defaultRegion);
      const { instanceSnapshots } = await lightsail.getInstanceSnapshots().promise();
      return instanceSnapshots!.map(item => ({
        name: item.name!,
        state: item.state,
        createdAt: item.createdAt
      }));
    },
    create: async (): Promise<Snapshot> => {
      return {};
    },
    destroy: async (id: string): Promise<void> => {}
  };
}
