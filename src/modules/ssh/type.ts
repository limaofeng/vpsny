import { KeyPair } from '../cloud/type';

/**
 * Identity
 */
export interface Credential {
  /**
   * 显示名称
   */
  name: string;
  /**
   * 用户名
   */
  username: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 密钥对
   */
  keyPair: KeyPair;
}

export interface SSHConnection {
  /**
   * 唯一识别码， 可以使用 server ID
   */
  id: string;
  status?: 'unauthorized' | 'available' | 'bad';
  /**
   * 主机名
   */
  hostname: string;
  /**
   * 端口, 默认 22
   */
  port: number;
  /**
   * 用户名
   */
  username: string;
  /**
   * 密码
   */
  password?: string;
  /**
   * 密钥对ID
   */
  keyPair?: string;
}

export type Lable = {
  name: string;
  value: string;
};

export interface Command {
  id: string;
  /**
   * 执行命令的服务器
   */
  node: string;
  /**
   * 主机地址
   * 例如: root@127.0.0.1
   */
  host: string;
  /**
   * 标签
   */
  lables: Lable[];
  /**
   * 执行状态
   */
  status: 'connecting' | 'authenticating' | 'executing' | 'success' | 'failure';
  /**
   * 输入
   * 例如： docker run
   */
  input: string;
  /**
   * 输出
   */
  output?: string;
  /**
   * 创建时间
   */
  createdAt?: Date;
  /**
   * 执行时间 (毫秒)
   */
  time?: number;
}
