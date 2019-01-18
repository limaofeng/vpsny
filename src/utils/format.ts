/* eslint-disable no-nested-ternary, no-mixed-operators, no-control-regex, no-useless-escape */
import moment, { Moment } from 'moment';

const stripTagsRE = /<\/?[^>]+>/gi;
const trimRe = /^\s+|\s+$/g;

/**
 * 对大于指定长度部分的字符串，进行裁剪，增加省略号（“...”）的显示。
 * @param {String} value 要裁剪的字符串
 * @param {Number} len 允许的最大长度
 * @param {Boolean} word True表示尝试以一个单词来结束
 * @return {String} 转换后的文本
 */
export function ellipsis(value = '', len: number, word = '...') {
  if (length(value) <= len) return value;
  let retVal = value;
  do {
    retVal = retVal.substr(0, retVal.length - 1);
  } while (length(retVal) > len - length(word));
  return retVal + word;
}

export function length(value: string) {
  return value.replace(/[^\x00-\xff]/g, 'rr').length;
}

export function mask(value: string, format: string = '') {
  return value.replace(RegExp(format, 'g'), str => str);
}

/**
 * 检查一个引用值是否为 undefined，若是的话转换其为空值。
 * @param value 要检查的值
 * @returns {*} 转换成功为空白字符串，否则为原来的值
 */
export function undef(value: string) {
  return value !== undefined ? value : '';
}

/**
 * 检查一个引用值是否为空，若是则转换到缺省值。
 * @param value 要检查的引用值
 * @param defaultValue 默认赋予的值（默认为""）
 * @return {*}
 */
export function defaultValue(value: any, defaultValue: any = '') {
  if (Array.isArray(value) && value.length === 0) {
    return defaultValue || value;
  }
  return value !== null ? value : defaultValue;
}

/**
 * 为能在HTML显示的字符转义&、<、>以及'。
 * @param {String} value 要编码的字符串
 * @return {String} 编码后的文本
 */
export function htmlEncode(value: string) {
  return !value
    ? value
    : String(value)
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

/**
 * 将&, <, >, and '字符从HTML显示的格式还原。
 * @param {String} value 解码的字符串
 * @return {String} 编码后的文本
 */
export function htmlDecode(value: string) {
  return !value
    ? value
    : String(value)
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
}

/**
 * 返回一个字符串，该字符串中的第一个字母转化为大写字母，剩余的为小写。
 * @param {String} value 要转换的字符串
 * @return {String} 转换后的字符串
 */
export function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.substr(1).toLowerCase() : value;
}

/**
 * 格式化数字到美元货币
 * @param v {Number/String} 要格式化的数字
 * @returns {string} 已格式化的货币
 */
export function usMoney(input: number): string {
  let number = input;
  number = Math.round((number - 0) * 100) / 100;
  let reVal = String(
    number === Math.floor(number) ? `${number}.00` : number * 10 === Math.floor(number * 10) ? `${number}0` : number
  );
  const ps = reVal.split('.');
  let whole = ps[0];
  const sub = ps[1] ? `.${ps[1]}` : '.00';
  const r = /(\d+)(\d{3})/;
  while (r.test(whole)) {
    whole = whole.replace(r, '$1,$2');
  }
  reVal = whole + sub;
  if (reVal.charAt(0) === '-') {
    return `-$${reVal.substr(1)}`;
  }
  return `$${reVal}`;
}

/**
 * 将某个值解析成为一个特定格式的日期。
 * @param v 要格式化的值
 * @param {String} format （可选的）任何有效的日期字符串（默认为“月/日/年”）
 * @return {Function} 日期格式函数
 */
export function date(v: string | Date | Moment, format = 'YYY-MM-DD'): string {
  if (!v) {
    return '';
  }
  if (v.constructor === Date) {
    v = moment(v as Date);
  }
  if (moment.isMoment(v)) {
    return v.format(format);
  }
  throw new Error('只支持 Date 与 Moment 对象的日期格式');
}

/**
 * 剥去所有HTML标签。
 * @param v 要剥去的文本
 * @return {String} 剥去后的HTML标签
 */
export function stripTags(v: string) {
  return !v ? v : String(v).replace(stripTagsRE, '');
}

const stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/gi;

/**
 * 剥去所有脚本（<script>...</script>）标签
 * @param v value 要剥去的文本
 * @returns {*} 剥去后的HTML标签
 */
export function stripScripts(v: string) {
  return !v ? v : String(v).replace(stripScriptsRe, '');
}

/**
 * 对文件大小进行简单的格式化（xxx bytes、xxx KB、xxx MB）
 * @param {Number} size 要格式化的数值
 * @param {String} unit 默认单位
 * @param {Number} scale 进制 默认 1024
 * @return {String} 已格式化的值
 */
export function fileSize(
  size: number,
  unit: string = 'bytes',
  config: {
    scale?: number;
    finalUnit?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';
    displayUnit?: boolean;
    mode?: 'short' | 'hide' | 'normal';
    units?: string[];
    precision?: number;
  } = {}
): string | number {
  const { scale = 1024, finalUnit = null, precision = null, mode = 'normal', units: alias } = config;
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let index = units.indexOf(unit);
  while ((size >= scale || finalUnit) && finalUnit !== units[index]) {
    size = Math.round((size * 10) / scale) / 10;
    index++;
  }
  if (precision !== null) {
    size =  parseInt(size.toFixed(precision).split('.')[1]) === 0 ? parseInt(size.toString()) : parseFloat(size.toFixed(precision));
  }
  if (mode === 'hide') {
    return size;
  } else if (mode === 'normal') {
    return `${size} ${alias ? alias[index] : units[index]}`;
  } else {
    const shorts = ['B', 'K', 'M', 'G', 'T', 'P'];
    return `${size} ${shorts[index]}`;
  }
}

/**
 * 依据某种（字符串）格式来转换数字。
 * <div style="margin-left:40px">例子 (123456.789):
 * <div style="margin-left:10px">
 * 0 - (123456) 只显示整数，没有小数位<br>
 * 0.00 - (123456.78) 显示整数，保留两位小数位<br>
 * 0.0000 - (123456.7890) 显示整数，保留四位小数位<br>
 * 0,000 - (123,456) 只显示整数，用逗号分开<br>
 * 0,000.00 - (123,456.78) 显示整数，用逗号分开，保留两位小数位<br>
 * 0,0.00 - (123,456.78) 快捷方法，显示整数，用逗号分开，保留两位小数位<br>
 * 在一些国际化的场合需要反转分组（,）和小数位（.），那么就在后面加上/i
 * 例如： 0.000,00/i
 * </div></div>
 *
 * @method format
 * @param {Number} v 要转换的数字。
 * @param {String} format 格式化数字的“模”。
 * @return {String} 已转换的数字。
 */
export function number(input: number, format: string): string {
  let v: any = input;
  if (!format) {
    return v;
  }
  v *= 1;
  if (typeof v !== 'number' || Number.isNaN(v)) {
    return '';
  }
  let comma = ',';
  let dec = '.';
  let i18n = false;

  if (format.substr(format.length - 2) === '/i') {
    format = format.substr(0, format.length - 2);
    i18n = true;
    comma = '.';
    dec = ',';
  }

  const hasComma = format.indexOf(comma) !== -1;
  let psplit = (i18n ? format.replace(/[^\d\,]/g, '') : format.replace(/[^\d\.]/g, '')).split(dec);

  if (psplit.length > 1) {
    v = v.toFixed(psplit[1].length);
  } else if (psplit.length > 2) {
    throw new Error(`NumberFormatException: invalid format, formats should have no more than 1 period: ${format}`);
  } else {
    v = v.toFixed(0);
  }

  let fnum = v.toString();

  if (hasComma) {
    psplit = fnum.split('.');

    const cnum = psplit[0];
    const parr = [];
    const j = cnum.length;
    let n = cnum.length % 3 || 3;

    for (let i = 0; i < j; i += n) {
      if (i !== 0) {
        n = 3;
      }
      parr[parr.length] = cnum.substr(i, n);
    }
    fnum = parr.join(comma);
    if (psplit[1]) {
      fnum += dec + psplit[1];
    }
  }
  return format.replace(/[\d,?\.?]+/, fnum);
}

/**
 * 可选地为一个单词转为为复数形式。例如在模板中，{commentCount:plural("Comment")}这样的模板语言如果commentCount是1那就是 "1 Comment"；
 * 如果是0或者大于1就是"x Comments"。
 * @param v {Number} 参与比较的数
 * @param s {String} singular 单词的单数形式
 * @param  p {String} plural （可选的） 单词的复数部分（默认为加上's'）
 * @returns {string}
 */
export function plural(v: number, s: string, p?: string) {
  return `${v} ${v === 1 ? s : p || `${s}s`}`;
}

/**
 * 字符串模版
 * @param v {String} 模版
 * @param values {Object} 数据对象
 * @returns {string}
 */
export function template(v: string, values: { [key: string]: string }) {
  return v.replace(/\{([^\\}]+)\}/, (substring, name) => values[name]);
}

export function color(input: string, format: 'hex' | 'rgb' | 'rgba', opacity: number = 1) {
  const that = input;
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  if (format === 'hex') {
    // 如果是rgb颜色表示
    if (/^(rgb|RGB)/.test(that)) {
      const aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
      let strHex = '#';
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        if (hex.length < 2) {
          hex = '0' + hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = that;
      }
      return strHex;
    } else if (reg.test(that)) {
      const aNum = that.replace(/#/, '').split('');
      if (aNum.length === 6) {
        return that;
      } else if (aNum.length === 3) {
        let numHex = '#';
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i];
        }
        return numHex;
      }
    }
    return that;
  } else {
    let sColor = input.toLowerCase();
    // 十六进制颜色值的正则表达式
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#';
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      // 处理六位的颜色值
      const sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
      }
      if (format === 'rgb') {
        return 'rgb(' + sColorChange.join(',') + ')';
      } else {
        return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
      }
    }
    return 'sColor';
  }
}
