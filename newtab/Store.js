/* eslint-disable */
import { observable } from 'mobx';

import { Api } from '@parity/parity.js';

// do the setup
const transport = new Api.Transport.Http('http://localhost:8545');
const api = new Api(transport);

const { eth, parity } = api;

// https://github.com/exodusmovement/cryptocompare
global.fetch = require('node-fetch');
const cc = require('cryptocompare');

class Store {
  @observable priceMulti = null;
  @observable priceFull = null;
  @observable accounts = null;

  constructor() {
    cc.priceMulti(['USD', 'ETH', 'EUR', 'GBP', 'BTC'], ['USD', 'ETH', 'EUR', 'GBP', 'BTC'])
      .then(prices => {
        this.priceMulti = prices;
      })
      .catch(console.error);

    cc.priceFull(['BTC', 'ETH'], ['USD', 'EUR', 'GBP'])
      .then(prices => {
        this.priceFull = prices;
      })
      .catch(console.error);

    parity.accountsInfo()
      .then(accounts => {
        Object.keys(accounts).forEach(account => {
          eth.getBalance(account)
            .then(balance => {
              accounts[account].account = account;
              accounts[account].balance = balance.div(1e18).toNumber();
            })
            .then(() => {
              this.accounts = Object.values(accounts);
            })
            .catch(console.error);
        })
      })
      .catch(console.error);
  }
}

export default new Store();