import axios from 'axios';
import Bluebird from 'bluebird';
import { Feature, InAction } from 'walkuere-rn';
import { IBlueprint, IBundle, IRegion } from './type';

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
    },
    queryRegions(state: DataBaseState, { payload }: InAction<IRegion[]>) {
      return { ...state, regions: payload };
    },
    queryBlueprints(state: DataBaseState, { payload }: InAction<IBlueprint[]>) {
      return { ...state, blueprints: payload };
    },
    queryBundles(state: DataBaseState, { payload }: InAction<IBundle[]>) {
      return { ...state, bundles: payload };
    }
  },
  effects: {
    *fetchRegions(state: any, { put, call }: any) {
      const { data: regions } = yield call(() => request.get('/regions'));
      yield put({ type: 'queryRegions', payload: regions });
    },
    *fetchBlueprints(state: any, { put, call }: any) {
      const { data: blueprints } = yield call(() => request.get('/blueprints'));
      yield put({ type: 'queryBlueprints', payload: blueprints });
    },
    *fetchBundles(state: any, { put, call }: any) {
      const { data: bundles } = yield call(() => request.get('/bundles'));
      yield put({ type: 'queryBundles', payload: bundles });
    }
  },
  subscriptions: {
    async setup({ dispatch }: any) {
      const {
        providers: { data: providers },
        bundles: { data: bundles },
        regions: { data: regions },
        blueprints: { data: blueprints },
        countrys: { data: countrys }
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
