import { SSHKey } from './Provider';
import { Bill, APIKey } from './Agent';

export * from './Provider';

export interface Account {
  id: string;
  provider: 'vultr' | 'lightsail';
  title?: string;
  alias?: string;
  name: string;
  email?: string;
  apiKey?: APIKey;
  bill?: Bill;
  sshkeys: SSHKey[];
  settings?: {
    /**
     * aws 需要查询的区域，过多的区域会导致查询效率底下
     */
    defaultRegion?: string;
    regions?: string[];
  };
}

export interface KeyPair {
  /**
   * 唯一识别码， 通过计算 privateKey 的 md5 得到
   */
  id: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 私钥
   */
  privateKey?: string;
  /**
   * 公钥
   */
  publicKey?: string;
  /**
   * 公钥指纹
   */
  publicKeyFingerprint?: string;
  /**
   * 密码
   */
  passphrase?: string;
}
