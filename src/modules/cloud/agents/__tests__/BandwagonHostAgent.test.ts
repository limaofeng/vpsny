import BandwagonHostAgent from '../BandwagonHostAgent';

describe('BandwagonHost', () => {
  const api = new BandwagonHostAgent({
    vpses: [
      // {veid: '1184627', apiKey: 'private_164PzMtfaLUGoZK6gFtKImOJ'}
      {veid: '1175697', apiKey: 'private_QyzzhvMlBrSKQWe4Z6Y8pq8x'}
    ]
  });
  it('test instance.list', async () => {
    jest.setTimeout(20000);
    const nodes = await api.instance.list();
    expect(nodes.length).toBeGreaterThanOrEqual(1); /*? nodes[0].name */
  });
  it('test instance.stop', async () => {
    jest.setTimeout(20000);
    await api.instance.stop('1175697');
  });
});
