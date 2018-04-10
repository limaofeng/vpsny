import { configureRealm } from '../src/utils/realm';

import { schema as regionSchema } from '../src/modules/home/models/Region';

describe('Home Enzyme Shallow', () => {
  const realmAsync = configureRealm([regionSchema], {
    host: '139.224.113.33',
    port: 9080,
    database: 'vpser',
    username: 'realm-admin',
    password: '7ia9PBcGgEcz'
  });
  it(' tests on counter components', async done => {
    const realm = await realmAsync;
  });
});
