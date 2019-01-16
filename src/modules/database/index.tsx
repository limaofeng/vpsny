import axios from 'axios';
import Bluebird from 'bluebird';
import { Feature } from 'walkuere-rn';
import { IBlueprint, IBundle } from './type';

const request = axios.create({
  baseURL: 'https://api.vpsny.app'
});

export interface DataBaseState {
  providers: any[];
  bundles: IBundle[];
  regions: any[];
  blueprints: IBlueprint[];
  countrys: any[];
}

export default new Feature({
  routes: {},
  namespace: 'database',
  state: {
    bundles: [],
    regions: [],
    blueprints: [],
    countrys: []
  },
  reducers: {
    setup(state: any, { payload }: any) {
      return { ...state, ...payload };
    }
  },
  effects: {},
  subscriptions: {
    async setup({ dispatch }: any) {
      const {
        providers: { data: providers },
        bundles: { data: bundles },
        regions: { data: regions },
        blueprints: { data: blueprints },
        countrys: { data: countrys}
      } = await Bluebird.props({
        providers: request.get('/providers'),
        bundles: request.get('/bundles'),
        regions: request.get('/regions'),
        blueprints: request.get('/blueprints'),
        countrys: request.get('/countrys')
      });
      dispatch({
        type: 'setup',
        payload: { providers, bundles, regions, blueprints, countrys }
      });
    }
  }
});
