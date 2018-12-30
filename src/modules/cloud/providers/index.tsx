import { ImageSourcePropType } from 'react-native';

import BandwagonHost from './bandwagon';
import DigitalOcean from './digitalocean';
import AWSLightsail from './lightsail';
import Vultr from './vultr';
import { Instance } from '../type';
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

export interface Provider {
  id: string;
  logo: ImageSourcePropType;
  name: string;
  description: string;
  routes(): any;
  actions(data: Instance, theme: Theme, dispatch: Dispatch, navigation: NavigationScreenProp<any>): ServerAction[];
  viewComponents(): string[];
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
