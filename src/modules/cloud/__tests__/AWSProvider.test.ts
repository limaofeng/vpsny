import { AWSLightsailAgent } from '../AWSProvider';

describe('AWSProvider', () => {
  const api = new AWSLightsailAgent({
    accessKeyId: 'AKIAJKX7F3VXTOKFKUSQ',// 污点
    secretAccessKey: '7aI9qdYa5P+ELGpI0hIcM87ymWs28Uv7GfVVEP3K'
  });
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
