import { DigitalOceanAgent } from '../DigitalOceanAgent';

describe('DigitalOcean', () => {
  const api = new DigitalOceanAgent({
    token: '02f9cddd086c7805dd46b776b0f5da93b32b0c18dc7617b18e7f05d62aa77715'
  });
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
