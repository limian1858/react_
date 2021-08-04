/* eslint-disable @typescript-eslint/camelcase */
import BigNumber from 'bignumber.js';
// @ts-ignore
import Cookies from 'js-cookie';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JsEncrypt from 'jsencrypt';

export const cookies = Cookies;

export const $utils = {
  deDecimals(val: string | number, decimals: string | number) {
    const decr = new BigNumber(10).pow(-decimals);
    return new BigNumber(val).multipliedBy(decr).toString();
  },
  accountEncode(account?: string) {
    return account ? `${account.substr(0, 6)}....${account.substr(-6)}` : '--';
  },
  deFormatObject(data: Record<string, any>, prefix?: string, store = {}) {
    return Object.keys(data).reduce((obj: any, key) => {
      const keyStr = prefix ? `${prefix}.${key}` : key;
      if ($utils.getType(data[key]) === 'object') {
        $utils.deFormatObject(data[key], keyStr, obj);
      } else {
        Reflect.set(obj, keyStr, data[key]);
      }
      return obj;
    }, store);
  },
  expireTime(value: number | string) {
    const now = +new Date();
    const expire = Number(value);
    const restSecond = expire - now;
    const isExpired = restSecond <= 0;
    //
    const d = Math.floor(restSecond / (60 * 60 * 24 * 1000));
    //
    const h = Math.floor((restSecond / (60 * 60 * 1000)) % 24);
    //
    const min = Math.floor((restSecond / (60 * 1000)) % 60);
    return {
      d,
      h,
      min,
      isExpired,
    };
  },

  ud(source: any[], row: any, action: 'update' | 'del', condiction: string) {
    const copyData = source;
    if (action === 'del') {
      const idx = copyData.findIndex(d => d[condiction] === row[condiction]);
      if (idx >= 0) {
        copyData.splice(idx, 1);
      }
    } else if (action === 'update') {
      const matched = copyData.find(d => d[condiction] === row[condiction]);
      matched && Object.assign(matched, row);
    }
    return [...copyData];
  },

  RSA(publicKey: string, message: string) {
    // eslint-disable-next-line camelcase
    // @ts-ignore
    const jse = new JsEncrypt();
    jse.setPublicKey(publicKey);
    // @ts-ignore
    return jse.encrypt(message, 'utf8');
  },

  hasOwn: (obj: object, key: string) => Object.hasOwnProperty.call(obj, key),

  isEmpty: (instance: object): boolean => Object.keys(instance).length === 0,

  /**
   * @param value  number
   * @param acc ；2 */
  formatNumber: (value: number | string, acc = 2) => {
    const bigValue = new BigNumber(value);
    return bigValue.isNaN() ? '--' : bigValue.toFormat(acc);
  },

  /**
   * @param value  number
   * @param acc ；2 */
  toFixed: (value: number | string, acc = 2, symbol = false) => {
    const bigValue = new BigNumber(value);
    if (bigValue.isNaN()) {
      return '--';
    }
    const s = symbol && bigValue.isGreaterThan(0) ? '+' : '';
    //
    if (acc === -1) {
      return `${s}${bigValue.toFixed()}`;
    }
    return `${s}${bigValue.toFixed(acc)}`;
  },

  /**
   * @param value */
  getType: (value: any): string =>
    Object.prototype.toString.call(value).slice(8, -1).toLowerCase(),

  /**
   * @param target
   * @param callback  */
  each: (
    target: any[] | { [key: string]: any },
    callback: (item: any, key: string, instance: any) => void,
  ) => {
    if (!target) {
      throw new Error('：');
    }

    //
    if (target instanceof Array) {
      target.forEach((item, key, instance) => {
        callback(item, `${key}`, instance); // key
      });
      return;
    }

    //
    Object.keys(target).forEach(key => {
      callback(target[key], key, target);
    });
  },
  /**
   * @param value
   * @param format ； yyyy-MM-dd hh:mm:ss */
  formatTime: (value: string | number, format = 'MM/dd/yyyy hh:mm:ss') => {
    const time = typeof value === 'string' ? value.replace(/-/g, '/') : value;
    const timer = new Date(Number(time));

    if (timer.toString() === 'Invalid Date') {
      return format;
    }

    const options = {
      //
      'y+': timer.getFullYear(),
      //
      'M+': timer.getMonth() + 1,
      //
      'd+': timer.getDate(),
      //
      'h+': timer.getHours(),
      //
      'm+': timer.getMinutes(),
      //
      's+': timer.getSeconds(),
      //
      'S+': timer.getMilliseconds(),
      //
      'q+': $utils.toFixed(
        new BigNumber(timer.getMonth()).plus(3).div(3).toNumber(),
        0,
      ),
    };

    let result = format;

    if (/y+/.test(format)) {
      result = format
        .replace(RegExp.$1, `${options['y+']}`)
        .substr(4 - RegExp.$1.length);
    }

    $utils.each(options, (elem, keys) => {
      if (new RegExp(`(${keys})`).test(result)) {
        result = result.replace(RegExp.$1, elem > 9 ? elem : `0${elem}`);
      }
    });
    return result;
  },

  toUTC(time: number | string) {
    if (time) {
      const t = typeof time === 'string' ? Number(time) : time;
      const [, r] = new Date(t).toUTCString().split(', ');
      return r;
    }
    return '--';
  },

  // search
  formatSearch: <T>(search: string): T => {
    if (!search) return {} as T;

    const searchSplit = search
      .substring(search.indexOf('?') + 1, search.length)
      .split('&');
    const result: { [key: string]: any } = {};

    searchSplit.forEach(elem => {
      const [key, value] = elem.split('=');

      result[key] = value;
    });
    return result as T;
  },
  hash: (hash: string) => {
    if (hash === '' || hash === undefined) {
      return '--';
    }
    return hash.substring(0, 6) + '...' + hash.substring(hash.length - 6, hash.length);
  },
};

// console.log($utils, 'utils');
