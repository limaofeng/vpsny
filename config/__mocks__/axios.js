import axios from 'axios';
import fetch from 'node-fetch';

async function NodeFetchAdapter(config) {
  const request = config;
  const res = await fetch(config.url);
  const data = await (res.headers.get('content-type').indexOf('json') != -1 ? res.json() : res.text());
  return {
    data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config: config,
    request
  };
}

export default {
  get: jest.fn((...args) => {
    return axios.get(args[0], {
      adapter: NodeFetchAdapter
    });
  })
};
