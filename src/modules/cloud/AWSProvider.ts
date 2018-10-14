import { CostExplorer, IAM, Lightsail } from 'aws-sdk/dist/aws-sdk-react-native';
import axios from 'axios';
import querystring from 'querystring';

import { format, md5 } from '../../utils';
import { Agent, APIKey, Bill, Continent, Country, User } from './Agent';
import { Features, ImageVersion, Instance, InstanceNetworking, Plan, Region, SSHKey, SystemImage } from './Provider';

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
    state: 'Virginia'
  },
  'us-east-2': {
    name: 'US East (Ohio)',
    continent: Continent.NA,
    country: Country.us,
    state: 'Virginia'
  },
  'us-west-1': {
    name: 'US West (N. California)',
    continent: Continent.NA,
    country: Country.us,
    state: 'California'
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
    state: 'Montreal'
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
    state: 'Sao paulo'
  }
};

function parseRegion(data: Lightsail.Region): Region {
  const location = AWSRegions[data.name!];
  return {
    id: data.displayName!.toLowerCase(),
    providers: [
      {
        id: data.name!,
        name: 'lightsail'
      }
    ],
    name: data.displayName!,
    state: location.state,
    country: location.country,
    continent: location.continent,
    availabilityZones: []
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
  const instance: Instance = {
    id: `${data.location!.regionName}:${data.name}`,
    name: data.name!,
    status: getStatus(data.state!.name!),
    state: {
      code: data.state!.code,
      status: data.state!.name!
    },
    hostname: data.publicIpAddress!,
    os: data.blueprintName!,
    ram: format.fileSize(data.hardware!.ramSizeInGb! * 1024, 'MB') as string,
    disk: (format.fileSize(data.hardware!.disks![0].sizeInGb!, 'GB') as string) + ' SSD',
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
      title: AWSRegions[data.location!.regionName!].state,
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

export class AWSLightsailAgent implements Agent {
  id: string;
  apiKey: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  alllightsails: Map<string, Lightsail> = new Map();
  lightsail: Lightsail;
  iam: IAM;
  ce: CostExplorer;
  static defaultRegion = 'us-east-1';
  constructor(apiKey: AWSAPIKey) {
    const { accessKeyId, secretAccessKey } = apiKey;
    this.id = md5(accessKeyId + ':' + secretAccessKey, ':');
    this.apiKey = apiKey;
    this.lightsail = new Lightsail({
      region: 'us-east-1',
      ...this.apiKey
    });
    this.iam = new IAM({
      region: 'us-east-1',
      ...this.apiKey
    });
    this.ce = new CostExplorer({
      region: 'us-east-1',
      ...this.apiKey
    });
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
    const { regions = [] } = await this.lightsail.getRegions().promise();
    return regions.map(data => parseRegion(data));
  }
  async pricing(): Promise<Plan[]> {
    const { bundles = [] } = await this.lightsail.getBundles().promise();
    const plans = bundles.filter(data => (data.supportedPlatforms || []).some(platform => platform === 'LINUX_UNIX'));
    return plans.map(data => parsePlan(data));
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
    const lightsails = await this.getAlllightsails();
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

  async getAlllightsails(): Promise<Lightsail[]> {
    if (this.alllightsails.size) {
      return Array.from(this.alllightsails.values());
    }
    const { regions: awsregions } = await this.lightsail.getRegions().promise();
    const regions = awsregions!.map(data => parseRegion(data));
    for (const {
      providers: [{ id }]
    } of regions) {
      if (id === this.lightsail.config.region) {
        this.alllightsails.set(id, this.lightsail);
        continue;
      }
      this.alllightsails.set(
        id,
        new Lightsail({
          region: id,
          ...this.apiKey
        })
      );
    }
    return Array.from(this.alllightsails.values());
  }
  async getlightsail(region: string): Promise<Lightsail> {
    await this.getAlllightsails();
    return this.alllightsails.get(region)!;
  }
  parseId(id: string) {
    const [region, instanceName] = id.split(':');
    return { region, instanceName };
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const lightsails = await this.getAlllightsails();
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
    reinstall: async (id: string): Promise<void> => {
      throw new Error(`AWS Lightsail(${id}) does not support \`reinstall\` operation`);
    }
  };
}
