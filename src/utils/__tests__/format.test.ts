import * as format from '../format';

describe('format utils', () => {
  it('test ellipsis', () => {
    expect(format.ellipsis('出现省略号吧，是不是', 12)).toBe('出现省略...');
  });

  it('test fileSize', () => {
    expect(format.fileSize(1023)).toBe('1023 bytes');
    expect(format.fileSize(1024)).toBe('1 KB');
    expect(format.fileSize(1024 * 1024)).toBe('1 MB');
  });

  it('test format date', () => {
    const data = new Date('1985-03-04 12:12:12');
    expect(format.date(data, 'YYYY-MM-DD HH:mm:ss')).toBe('1985-03-04 12:12:12');
  });

  it('test format number', () => {
    expect(format.number(1000, '0.00')).toBe('1000.00');
  });

  it('test string htmlEncode', () => {
    expect(format.htmlEncode('<div><span>Kelly</span> Harber</div>')).toBe(
      '&lt;div&gt;&lt;span&gt;Kelly&lt;/span&gt; Harber&lt;/div&gt;'
    );
  });

  it('test string htmlDecode', () => {
    expect(format.htmlDecode('&lt;div&gt;&lt;span&gt;Kelly&lt;/span&gt; Harber&lt;/div&gt;')).toBe(
      '<div><span>Kelly</span> Harber</div>'
    );
  });

  it('test string capitalize', () => {
    expect(format.capitalize('Alivia Rapid')).toBe('Alivia rapid');
  });
});
