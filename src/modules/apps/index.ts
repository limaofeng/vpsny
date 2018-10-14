import React from 'react';
import Bluebird from 'bluebird';
import { Feature } from 'walkuere-rn';
import querystring from 'querystring';
import Handlebars from 'handlebars/dist/cjs/handlebars';

import { uuid } from '../../utils';
import Catalog from './views/Catalog';
import Services from './views/Services';
import ServiceNew from './views/ServiceNew';
import ServiceView from './views/ServiceView';

export type Port = {
  protocol?: 'tcp' | 'udp' | 'http' | 'https';
  private?: number;
  public?: number;
};

export type Link = {
  service?: string;
  alias?: string;
};
export type Volume = {
  local?: string;
  dest?: string;
};
export type Env = {
  key?: string;
  value?: string;
};

export interface Service {
  id?: string;
  name: string;
  image: string;
  summary: string;
  configs: {
    nodes: string[];
    ports: Port[];
    links: Link[];
    volumes: Volume[];
    envs: Env[];
  };
}

export function generateCommand(service: Service) {
  const { image, name } = service;
  const { envs, ports, volumes, links } = service.configs;
  const source = `docker run -d
    {{~#if name}} --name='{{name}}' {{/if}}
    {{~#ports}} -p {{public}}:{{private}}{{/ports}}
    {{~#envs}} -e {{key}}={{value}}{{/envs}}
    {{~#volumes}} -v {{local}}:{{dest}}{{/volumes}}
    {{~#links}} --link {{service}}:{{alias}}{{/links}}
    {{~#if image}} {{image}} {{/if}}`;
  const template = Handlebars.compile(source);
  const result = template({
    envs: envs.filter(({ key }) => !!key),
    ports: ports.filter(({ private: prv }) => !!prv),
    volumes: volumes.filter(({ dest }) => !!dest),
    links: links.filter(({ alias }) => !!alias),
    image,
    name
  });
  console.log(result);
  return result;
}

export default new Feature({
  routes: {
    Catalog,
    Services,
    ServiceNew,
    ServiceView
  },
  namespace: 'apps',
  state: {
    services: [],
    catalogs: []
  },
  reducers: {
    deploy(state: any, { payload: service }: any) {
      const { services } = state;
      return { ...state, services: [...services, { ...service, id: uuid() }] };
    },
    destroy(state: any, { payload: { id } }: any) {
      const { services } = state;
      return { ...state, services: services.filter((s: any) => s.id !== id) };
    }
  },
  effects: {}
});
