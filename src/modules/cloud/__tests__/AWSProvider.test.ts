import { AWSLightsailAgent } from '../AWSProvider';

describe('AWSProvider', () => {
  const api = new AWSLightsailAgent(
    {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // 污点
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    {
      defaultRegion: 'us-east-1',
      regions: []
    }
  );
  const id = 'us-east-2:WordPress-512MB-Ohio-1';
  it('test user', async () => {
    const user = await api.user(); /*? $.id */
    expect(user.name).toBe('limaofeng'); /*? user.name */
  });
  it('test bill', async () => {
    const bill = await api.bill();
    expect(bill).not.toBeNull();
  });
  it('test sshkeys', async () => {
    jest.setTimeout(20000);
    const sshkeys = await api.sshkeys();
    expect(sshkeys.length).toBeGreaterThan(0);
  });
  it('test regions', async () => {
    const regions = await api.regions();
    expect(regions).toHaveLength(13);
  });
  it('test plans', async () => {
    const plans = await api.pricing();
    expect(plans).toHaveLength(7);
  });
  it('test instance.list', async () => {
    jest.setTimeout(20000);
    const nodes = await api.instance.list();
    expect(nodes.length).toBeGreaterThanOrEqual(1); /*? nodes[0].name */
  });
});
