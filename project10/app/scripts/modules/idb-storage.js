/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as idb from 'idb';

const CART_STORE = 'cart';
const RW = 'readwrite';

export default class IDBStorage {

  constructor(id = 'mfs-cart-items') {
    this._id = id;
    this._open();
  }

  save(items) {
    return this._dbPromise.then(db => {
      const tx = db.transaction(CART_STORE, RW);
      const store = tx.objectStore(CART_STORE);
      return store.clear().then(() => {
        const addAll = items.map((item) => {
          return store.add({sku: (item.sku), qty: (item.qty)});
        });
        return Promise.all(addAll);
      }).then(() => {
        return tx.complete;
      });
    });
  }

  load() {
    return this._dbPromise.then(db => {
      return db.transaction(CART_STORE, RW)
        .objectStore(CART_STORE)
        .getAll();
    });
  }

  delete() {
  }

  count() {
    return this._dbPromise.then(db => {
      const tx = db.transaction(CART_STORE);
      return tx.objectStore(CART_STORE).count();
    });
  }

  _close() {
    return this._dbPromise.then(db => {
      let closePromise = db.close();
      this._dbPromise = null;
      return closePromise;
    });
  }

  _open() {
    return this._dbPromise = idb.open(this._id, 1, upgradeDB => {
      upgradeDB.createObjectStore(CART_STORE, {autoIncrement: true});
    });
  }

  set key(value) {
    if (value === this._id) return;
    this._close().then(() => {
      this._id = value;
      this._open();
    });
  }

  get key() {
    return this._id;
  }

  get storage() {
    return this._dbPromise;
  }
}
