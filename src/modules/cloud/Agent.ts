import { Plan, Region, SystemImage, SSHKey, Instance, Features } from './Provider';
import { IBundle, IRegion, IBlueprint } from '@modules/database/type';

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
  [key: string]: any;
}

export interface Bill {
  balance: number;
  pendingCharges: number;
}

export interface Snapshot {
  id: string;
  os: string;
  name: string;
  size: number;
  uncompressed?: number;
  md5?: string;
  sticky?: boolean;
  expires?: number;
  fileName?: string;
  downloadLink?: string;
  createdAt?: Date;
  status?: 'complete' | 'pending';
  [key: string]: any;
}

export interface Backup {
  id: string;
  [key: string]: any;
}

export interface Agent {
  id: string;
  deploy(
    hostname: string,
    bundle: IBundle,
    region: IRegion,
    blueprint: IBlueprint,
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
     * @param id 实例ID
     * @param force 是否强制停止
     *        搬瓦工支持该参数
     */
    stop(id: string, force?: boolean): Promise<void>;
    /**
     * 启动实例
     */
    start(id: string): Promise<void>;
    /**
     * 重新启动实例 等同 reboot
     */
    restart(id: string): Promise<void>;
    /**
     * 重新安装
     */
    reinstall(id: string, os?: string): Promise<void | string>;
    /**
     * 销毁实例
     */
    destroy(id: string): Promise<void>;
  };
  snapshot: {
    list(id?: string): Promise<Snapshot[]>;
    create(id: string, name: string): Promise<Snapshot | string>;
    delete(id: string): Promise<void>;
  };
  backup: {
    list(id?: string): Promise<Backup[]>;
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
