import Handlebars from 'handlebars/dist/cjs/handlebars';

import { Port, Env, Link, Volume } from '../apps';

export default {
  installDocker() {
    return 'curl https://releases.rancher.com/install-docker/17.03.sh | sh';
  },
  docker: {
    run(name: string, image: string, ports: Port[], envs: Env[], links: Link[], volumes: Volume[]) {
      const source = `docker run -d
      {{~#if name}} --name='{{name}}' {{/if}}
      {{~#ports}} -p {{public}}:{{private}}{{/ports}}
      {{~#envs}} -e {{key}}={{value}}{{/envs}}
      {{~#volumes}} -v {{local}}:{{dest}}{{/volumes}}
      {{~#links}} --link {{service}}:{{alias}}{{/links}}
      {{~#if image}} {{image}} {{/if}}`;
      const template = Handlebars.compile(source);
      return template({
        envs: envs.filter(({ key }) => !!key),
        ports: ports.filter(({ private: prv }) => !!prv),
        volumes: volumes.filter(({ dest }) => !!dest),
        links: links.filter(({ alias }) => !!alias),
        image,
        name
      });
    }
  }
};
