import { ProviderType } from './type';

export interface AWSLocation {
  availabilityZone: string;
  region: string;
}
export interface SSHKey {
  id?: string;
  name: string;
  createdAt?: Date;
  fingerprint?: string;
  /**
   * AWS.Lightsail API 不提供查看 publicKey 的接口
   */
  publicKey?: string;
  /**
   * AWS.Lightsail 字段
   */
  location?: AWSLocation;
}

export interface Features {
  /**
   * IPv6
   */
  IPv6: boolean;
  /**
   * Auto Backups
   */
  AutoBackups: boolean;
  /**
   * DDOS Protection
   */
  DDOSProtection: boolean;
  /**
   * Private Network
   */
  PrivateNetwork: boolean;
}

/**
 * 定价方案
 */
export interface Plan {
  /**
   * 服务商ID标示
   */
  id: string;
  /**
   * 务提供商
   */
  provider: string;
  /**
   * 名称
   */
  name: string;
  /**
   * cpu 核心数
   */
  vcpu: number;
  /**
   * 内存
   */
  ram: number;
  /**
   * 磁盘大小
   */
  disk: number;
  /**
   * 带宽
   */
  bandwidth: number;
  /**
   * 类型： SSD / DEDICATED
   */
  type: string;
  /**
   *  每月收费
   */
  price: number;
  /**
   * 是否可用 (如果该值为 true regions.length = 0  表示全区可用 )
   */
  isActive: boolean;
  /**
   * 适用地区
   */
  regions: string[];
}

export interface RegionProvider {
  id: string;
  name?: string;
  type: ProviderType;
  availabilityZones?: AvailabilityZone[];
  features?: {
    ddosProtection: string;
    blockStorage: string;
  };
  [key: string]: any;
}

export interface AvailabilityZone {
  zoneName: string;
  state: string;
}

/**
 * 区域
 */
export interface Region {
  /**
   * 使用默认的 name 作为 ID 如果不同的服务商 name 一致， 认为是同一区域
   */
  id: string;
  /**
   * 服务商
   */
  providers: RegionProvider[];
  /**
   * 名称
   */
  name: string;
  /**
   * 国家
   */
  country: string;
  /**
   * 洲
   */
  state: string;
  /**
   * 大陆，州
   */
  continent: string;
}

export interface OS {
  id: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 版本
   */
  versions: [string];
  /**
   * 系统
   */
  family: string;
  /**
   * 架构
   */
  arch: string;
}

export interface ImageVersion {
  id: number;
  name: string;
  arch: string;
}

export interface SystemImage {
  id: number;
  type: string; // os | app
  name: string;
  versions?: ImageVersion[];
  version?: ImageVersion;
}

export interface App {
  id: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 版本
   */
  version: string;
  family: string; // 系统
  surcharge: number; // 附加费用
}

export interface Product {}

export type FirewallPortRule = {
  fromPort: number;
  toPort: number;
  protocol: string;
  accessFrom: string;
  accessType: string;
  commonName: string;
  accessDirection: string;
};

export type InstanceNetworking = {
  isStaticIp: boolean;
  publicIpAddress: string;
  privateIpAddress: string;
  firewall: FirewallPortRule[];
};

export type Location = {
  /**
   * 原始值
   */
  title: string;
  /**
   * 可用区
   */
  availabilityZone?: string;
  /**
   * 关联地区编码
   */
  region: string;
  [key: string]: any;
};

export type Disk = {
  isSystemDisk: boolean;
  name: string;
  iops: number;
  size: number;
  use: number;
  path: string;
  isAttached: boolean;
  attachedTo: string;
  attachmentState: string;
  createdAt: Date;
};

/**
 * 实例
 */
export interface Instance {
  /**
   * SUBID
   */
  id: string;
  /**
   * 显示名
   * Vultr -> lable
   * Lightsail -> name
   * label:
   */
  name: string;
  /**
   * 一般为公网 IP 地址
   * Vultr -> main_ip
   * Lightsail -> publicIpAddress
   */
  hostname: string;
  /**
   * 系统信息
   * os: Ubuntu 16.04 x64
   */
  os: string;
  /**
   * 内存
   * ram: 1024 MB
   */
  ram: {
    use?: number;
    size: number;
  };
  swap?: {
    use: number;
    size: number;
  };
  /**
   * 磁盘
   * disk: Virtual 25 GB
   */
  disk: {
    use?: number;
    size: number;
    type: 'SSD' | 'HDD';
  };
  /**
   * CPU
   * vcpu: 1
   */
  vcpu: number;
  /**
   * 位置
   * location: Tokyo
   */
  location: Location;
  /**
   * 状态
   */
  status: string;
  /**
   * 状态
   */
  state?: {
    code?: number;
    /**
     * 状态
     * status: pending | active | suspended | closed
     */
    status: 'pending' | 'active' | 'suspended' | 'closed' | string;
    /**
     * power_status
     */
    powerStatus?: 'running' | 'stopped' | 'starting';
    /**
     * server_state: none | locked | installingbooting | isomounting | ok.
     *  locked  -> Installing
     *  installingbooting -> Resizeing
     */
    serverState?: 'none' | 'ok' | 'locked' | 'installingbooting' | 'isomounting';
    /**
     *  服务暂停标记
     *  支持的平台：
     *        搬瓦工有效
     */
    suspended?: boolean;
  };
  /**
   * 已产生的费用
   * pending_charges: 0.24
   */
  pendingCharges?: number;
  /**
   * 每月成本
   *  cost_per_month: 5.00
   */
  costPerMonth?: number;
  /**
   * 带宽信息
   */
  bandwidth: {
    /**
     * 已使用额度
     * current_bandwidth_gb = 0.0040
     */
    current: number;
    /**
     * allowed_bandwidth_gb = 1000
     * 允许额度
     */
    allowed: number;
    /**
     * 下次流量重置日期
     */
    resets?: string;
  };
  /**
   * 公网IP
   */
  publicIP: string;
  /**
   * 内部IP
   * Vultr -> internal_ip
   * Lightsail -> privateIpAddress
   */
  internalIP: string;
  /**
   * 付费方案
   * VPSPLANID:201
   */
  plan: string;
  /**
   * 地区
   * DCID: 25
   */
  region: string;
  image: {
    /**
     * OSID: '215';
     * APPID: '0';
     */
    id: string;
    /**
     * 用于区分 OSID / APPID
     */
    type: 'os' | 'app';
  };
  disks?: Disk[];
  /**
   * 服务商
   */
  provider: ProviderType;
  /**
   *  默认 root 密码
   *  defaultPassword： 3Vy.BTwaxk8Xt(z]
   *  Vultr 可用
   */
  defaultPassword?: string;
  /**
   * Vultr 专有字段
   * tag:
   */
  tag?: string;
  /**
   * Vultr 专有字段
   */
  kvmUrl?: string;
  /**
   * Vultr 专有字段
   * auto_backups = no
   */
  autoBackups?: boolean;
  /**
   * Vultr 专有字段
   * 防火墙分组
   */
  firewall?: string;
  networks?: {
    IPv4?: [
      {
        type: string;
        /**
         * main_ip = 45.77.22.168
         */
        ip: string;
        /**
         * netmask_v4 = 255.255.254.0
         */
        netmask: string;
        /**
         *  gateway_v4 = 45.77.22.1
         */
        gateway: string;
      }
    ];
    IPv6?: [
      {
        type: string;
        ip: string;
        gateway: string;
        netmask: string;
      }
    ];
  };
  /**
   * Vultr 专有字段
   */
  IPv6?: {
    ip: string;
    networkSize: number;
    network: string;
    networks: {
      ip: string;
      networkSize: number;
      network: string;
    }[];
  };
  /**
   * Vultr 专有字段
   */
  IPv4?: {
    /**
     * main_ip = 45.77.22.168
     */
    ip: string;
    /**
     * netmask_v4 = 255.255.254.0
     */
    netmask: string;
    /**
     *  gateway_v4 = 45.77.22.1
     */
    gateway: string;
  };
  /**
   * AWS Lightsail 专有字段
   */
  networking?: InstanceNetworking;
  /**
   * 对应的账户
   */
  account: string;
  /**
   * 创建时间
   *  date_created: 2018-09-15 22:24:07
   */
  createdAt?: Date;
  /**
   * BandwagonHost 字段
   */
  liveInfo?: {
    /**
     * Running or Stopped
     */
    ve_status: string;
    /**
     * MAC address of primary network interface
     */
    ve_mac1: string;
    /**
     * Occupied (mapped) disk space in bytes
     */
    ve_used_disk_space_b: number;
    /**
     * Actual size of disk image in GB
     */
    ve_disk_quota_gb: number;
    /**
     * 0 = CPU is not throttled, 1 = CPU is throttled due to high usage. Throttling resets automatically every 2 hours.
     */
    is_cpu_throttled: number;
    /**
     *  SSH port of the VPS (returned only if VPS is running)
     */
    ssh_port: number;
    /**
     * Result of "hostname" command executed inside VPS
     */
    live_hostname: string;
    /**
     * Raw load average string
     */
    load_average: string;
    /**
     * Amount of available RAM in KB
     */
    mem_available_kb: number;
    /**
     * Total amount of Swap in KB
     */
    swap_total_kb: number;
    /**
     * Amount of available Swap in KB
     */
    swap_available_kb: number;
  };
  lastUpdateTime?: number;
}

/**
 * 服务商
 *
 * @interface Provider
 */
export interface Provider {
  /**
   * 标示
   */
  id: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 地址
   */
  url: string;
  /**
   * 产品
   */
  products: string[];
  /**
   * 所有价位
   */
  prices: string[];

  images: SystemImage[];
  /**
   * 获取定价
   *
   * @returns {[Plan]}
   * @memberof Provider
   */
  pricing(): Plan[];
  /**
   * 获取定价
   *
   * @param {string} region
   * @returns {[Plan]}
   * @memberof Provider
   */
  pricing(region?: string): Plan[];
  /**
   * 支持的地区
   *
   * @returns {[Region]}
   * @memberof Provider
   */
  regions(): Region[];
  /**
   * 支持的地区
   *
   * @param {string} plan
   * @returns {[Region]}
   * @memberof Provider
   */
  regions(plan: string): Region[];
  /**
   * 支持的系统
   *
   * @returns {[OS]}
   * @memberof Provider
   */
  os(): OS[];
  /**
   * 支持安装的应用
   *
   * @returns {[App]}
   * @memberof Provider
   */
  apps(): App[];
}
