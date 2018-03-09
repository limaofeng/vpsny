import { merge } from 'lodash';

const isStringified = str => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export default class MockAsyncStorage {
  constructor() {
    this.store = new Map();
  }

  size() {
    return this.store.size;
  }

  getStore() {
    return new Map(this.store);
  }

  async getItem(k, cb) {
    const val = this.store.get(k);
    if (cb) cb(null, val);
    return val;
  }

  async setItem(k, v, cb) {
    this.store.set(k, v);
    if (cb) cb(null);
  }

  async removeItem(k, cb) {
    this.store.delete(k);
    if (cb) cb(null);
  }

  async clear(cb) {
    this.store.clear();
    if (cb) cb(null);
  }

  async getAllKeys(cb) {
    const keys = Array.from(this.store.keys());
    if (cb) cb(null, keys);
    return keys;
  }

  async multiGet(keys, cb) {
    const entries = Array.from(this.store.entries());
    const requested = entries.filter(([k]) => keys.includes(k));
    if (cb) cb(null, requested);
    return requested;
  }

  async multiSet(entries, cb) {
    for (const [key, value] of entries) {
      this.store.set(key, value);
    }
    if (cb) cb(null);
  }

  async multiRemove(keys, cb) {
    for (const key of keys) {
      this.store.delete(key);
    }
    if (cb) cb(null);
  }
  async mergeItem(key, value, cb) {
    const item = await this.getItem(key);

    if (!item) throw new Error(`No item with ${key} key`);
    if (!isStringified(item)) throw new Error(`Invalid item with ${key} key`);
    if (!isStringified(value)) throw new Error(`Invalid value to merge with ${key}`);

    const itemObj = JSON.parse(item);
    const valueObj = JSON.parse(value);
    const merged = merge(itemObj, valueObj);

    await this.setItem(key, JSON.stringify(merged));

    if (cb) cb(null);
  }

  async multiMerge(entries, cb) {
    const errors = [];
    /* eslint no-restricted-syntax: "off" */
    /* eslint no-await-in-loop: "off" */
    for (const [key, value] of entries) {
      try {
        await this.mergeItem(key, value);
      } catch (err) {
        errors.push(err);
      }
    }

    if (errors.length) {
      if (cb) cb(errors);
      return Promise.reject(errors);
    }

    if (cb) cb(null);
    return Promise.resolve();
  }
}
