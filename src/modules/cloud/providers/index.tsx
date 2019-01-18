import { ImageSourcePropType } from 'react-native';

import BandwagonHost from './bandwagon';
import DigitalOcean from './digitalocean';
import AWSLightsail from './lightsail';
import Vultr from './vultr';
import { Instance, ProviderType } from '../type';
import { Theme } from '@components';
import { Dispatch } from 'redux';
import { NavigationScreenProp } from 'react-navigation';

export type ComponentName = 'AccountNew' | 'AccountView' | 'ServerView';

export interface ServerAction {
  name: string;
  execute: () => Promise<void>;
  dialog?: () => {
    additions?: React.ReactElement<any>;
    title: string;
    message: string;
    type: 'info' | 'warn' | 'info';
    okText: string;
    loadingText: string;
  };
}

export interface Features {
  deploy: boolean;
}

export interface Provider {
  /**
   * 唯一标示
   */
  id: ProviderType;
  /**
   * Logo
   */
  logo: ImageSourcePropType;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 功能特征
   */
  features: Features;
  /**
   * 扩展路由
   */
  routes(): any;
  /**
   * VPS 动作
   * @param data 当前 VPS 对象
   * @param theme 主题选项
   * @param dispatch Redux Dispatch 对象
   * @param navigation 路由对象
   */
  actions(data: Instance, theme: Theme, dispatch: Dispatch, navigation: NavigationScreenProp<any>): ServerAction[];
  /**
   * 返回自定义组件
   * @param name 组件标示
   */
  getComponent(name: ComponentName): any;
}

const providers = new Map<string, Provider>();

export const CloudManager = {
  register: (provider: Provider) => {
    providers.set(provider.id, provider);
  },
  getProvider: (key: string): Provider => {
    return providers.get(key)!;
  },
  getProviders: (): Provider[] => {
    return Array.from(providers.values());
  },
  getRoutes: (): JSX.Element | any => {
    let routes = {};
    for (const [key, value] of providers) {
      routes = { ...routes, ...value.routes() };
    }
    return routes;
  }
};

CloudManager.register(BandwagonHost);
CloudManager.register(Vultr);
CloudManager.register(DigitalOcean);
CloudManager.register(AWSLightsail);
