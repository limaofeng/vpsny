export interface IBundle {
  /**
   * ID标示
   */
  id?: any;
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
   * 内存 单位 MB
   */
  ram: number;
  /**
   * 磁盘大小 单位 GB
   */
  disk: number;
  /**
   * 带宽 单位 GB
   */
  bandwidth: number;
  /**
   * 类型： SSD / DEDICATED
   * Vultr 该字段有值
   */
  type?: string;
  /**
   *  每月收费
   */
  price: number;
  /**
   * 是否可用 (如果该值为 true regions.length = 0  表示全区可用 )
   */
  available: boolean;
  requirements: {
    /**
     * 适用地区
     */
    regions: string[];
    /**
     * 支持的系统
     * AWS Lightsail 会区分平台
     */
    supportedPlatforms?: string[];
  };
}

export interface IBlueprint {
  /**
   * ID标示
   */
  id?: any;
  /**
   * 提供商
   */
  provider: string;
  /**
   * 类型
   * iso | snapshot | backup | application | os
   */
  type: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 系列
   */
  family: string;
  /**
   * 版本
   */
  version?: string;
  /**
   * CPU架构
   */
  arch?: string;
  /**
   * 是否可用
   */
  available: boolean;
  /**
   * 平台
   */
  platform: 'LINUX_UNIX' | 'WINDOWS' | string;
  requirements?: {
    /**
     * 适用地区
     */
    regions?: string[];
    /**
     * 最小磁盘空间
     */
    minDiskSize?: number;
  };
  /**
   * License Url
   */
  licenseUrl?: string;
}

export interface AvailabilityZone {
  zoneName: string;
  state: string;
}

export interface IRegion {
  id?: any;
  /**
   * 名称
   * 一般为城市或者洲的名称
   */
  name: string;
  /**
   * 提供商
   */
  provider: 'vultr' | string;
  /**
   * 国家编码
   */
  country: string;
  /**
   * 州 / 邦
   */
  state: string;
  /**
   * 大洲，大陆
   */
  continent: string;
  /**
   * 是否可用
   */
  available: boolean;
  /**
   * 可用区
   * AWS 时，可用
   */
  availabilityZones?: AvailabilityZone[];
  /**
   * DigitalOcean 时，可用
   */
  features?: string[];
}