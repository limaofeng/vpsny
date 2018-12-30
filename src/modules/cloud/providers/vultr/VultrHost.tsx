import { Provider } from '../';
export class VultrHost implements Provider {
  id = 'vultr';
  name = 'Vultr';
  logo = require('./assets/vultr.png');
  description = 'Global Cloud Hosting';
  routes(): any {
    return {};
  }
  options(): any[] {
    throw new Error('Method not implemented.');
  }
  viewComponents(): string[] {
    return [''];
  }
  getComponent(name: string) {
    throw new Error('Method not implemented.');
  }
}
