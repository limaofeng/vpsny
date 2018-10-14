import { Plan, Region, SystemImage, SSHKey, Instance, Features } from './Provider';

export enum Country {
  au = 'Australia',
  de = 'Germany',
  fr = 'France',
  gb = 'United Kingdom',
  jp = 'Japan',
  nl = 'Netherlands',
  sg = 'Singapore',
  us = 'United States',
  ca = 'Canada',
  ie = 'Ireland',
  kr = 'Korea',
  in = 'India',
  br = 'Brazil'
}

export enum Continent {
  AF = 'Africa',
  EU = 'Europe',
  AS = 'Asia',
  OA = 'Oceania',
  NA = 'North America',
  SA = 'South America',
  AN = 'Antarctica'
}

export interface APIKey {}

export interface User {
  id: string;
  apiKey: APIKey;
  name: string;
  email: string;
  acls?: string[];
}

export interface Bill {
  balance: number;
  pendingCharges: number;
}

export interface Agent {
  id: string;
  pricing(): Promise<Plan[]>;
  regions(): Promise<Region[]>;
  images(): Promise<SystemImage[]>;
  deploy(
    hostname: string,
    plan: Plan,
    region: Region,
    image: SystemImage,
    sshkeys: SSHKey[],
    features: Features
  ): Promise<string>;
  sshkeys(): Promise<SSHKey[]>;
  createSSHKey(data: SSHKey): Promise<void>;
  updateSSHKey(data: SSHKey): Promise<void>;
  destroySSHKey(id: string): Promise<void>;
  user(): Promise<User>;
  bill(): Promise<Bill>;
  instance: {
    /**
     * 获取全部实例
     */
    list(): Promise<Instance[]>;
    /**
     * 获取单个实例的信息
     */
    get(id: string): Promise<Instance>;
    /**
     * 停止实例
     */
    stop(id: string): Promise<void>;
    /**
     * 启动实例
     */
    start(id: string): Promise<void>;
    /**
     * 重新启动实例
     */
    restart(id: string): Promise<void>;
    /**
     * 重启
     */
    reboot(id: string): Promise<void>;
    /**
     * 重新安装
     */
    reinstall(id: string): Promise<void>;
    /**
     * 销毁实例
     */
    destroy(id: string): Promise<void>;
  };
}

interface Log {
  name: string;
  lastTime: Date;
  nextTime: Date;
}

export class DefaultAgent {
  tasks: any;
  logs: Log[] = [];
}