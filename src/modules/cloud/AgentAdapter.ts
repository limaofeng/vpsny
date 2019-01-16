import { AppState } from '..';
import { Agent, User, Bill, Snapshot } from './Agent';
import { Features, Instance, Plan, Region, SSHKey, SystemImage } from './type';

type Select = (finder: (state: AppState) => any) => any;

export default class AgentAdapter implements Agent {
  id = 'adapter';
  agents = new Map<string, Agent>();
  instances: Instance[] = [];
  select: Select;
  constructor(agents: Map<string, Agent>, select: Select) {
    this.agents = agents;
    this.select = select;
  }
  setInstances(instances: Instance[]): void {
    this.instances = instances;
  }
  pricing(): Promise<Plan[]> {
    throw new Error('Method not implemented.');
  }
  regions(): Promise<Region[]> {
    throw new Error('Method not implemented.');
  }
  images(): Promise<SystemImage[]> {
    throw new Error('Method not implemented.');
  }
  deploy(
    hostname: string,
    plan: Plan,
    region: Region,
    image: SystemImage,
    sshkeys: SSHKey[],
    features: Features
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  sshkeys(): Promise<SSHKey[]> {
    throw new Error('Method not implemented.');
  }
  createSSHKey(data: SSHKey): Promise<void> {
    throw new Error('Method not implemented.');
  }
  updateSSHKey(data: SSHKey): Promise<void> {
    throw new Error('Method not implemented.');
  }
  destroySSHKey(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  user(apiKey?: string | undefined): Promise<User> {
    throw new Error('Method not implemented.');
  }
  bill(): Promise<Bill> {
    throw new Error('Method not implemented.');
  }
  current(id: string): Agent {
    const instances = this.select(state => {
      return state.cloud.instances;
    });
    const instance = instances.find((i: Instance) => i.id === id) as Instance;
    const agent = this.agents.get(instance.account) as Agent;
    console.log('matching agent ', instance.provider + ':' + instance.account, ' -> ', agent);
    return agent;
  }
  instance = {
    list: async (): Promise<Instance[]> => {
      const list = [];
      for (const [key, agent] of this.agents) {
        if (!key.includes(':')) {
          continue;
        }
        const result = await agent.instance.list();
        list.push(...result);
      }
      return list;
    },
    get: async (id: string): Promise<Instance> => {
      return await this.current(id).instance.get(id);
    },
    stop: async (id: string): Promise<void> => {
      await this.current(id).instance.stop(id);
    },
    start: async (id: string): Promise<void> => {
      await this.current(id).instance.start(id);
    },
    restart: async (id: string): Promise<void> => {
      await this.current(id).instance.restart(id);
    },
    destroy: async (id: string): Promise<void> => {
      await this.current(id).instance.destroy(id);
    },
    reinstall: async (id: string): Promise<void> => {
      await this.current(id).instance.reinstall(id);
    }
  };
  snapshot = {
    list: async (): Promise<Snapshot[]> => {
      return [];
    },
    create: async (): Promise<Snapshot> => {
      return {};
    },
    destroy: async (id: string): Promise<void> => {}
  };
}
