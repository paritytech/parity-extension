import { h, Component } from 'preact';
import { observer } from 'mobx-observer';
import './App.css';

const localforage = require('localforage');

import {
  Converter,
  EthBtc,
  Wallet
} from './Components';

import Store from './Store';

@observer
class App extends Component {
  constructor () {
    super();
    this.state = {
      firstTime: false,
      stylePiggy: '#F4F3EF',
      styleConvert: '#8c817b',
      styleBank: '#8c817b',
      appBluePosition: '0rem',
      styleUSD: '#FCFEFC',
      styleGBP: '#8c817b',
      styleEUR: '#8c817b',
      bluePosition: '0rem',
      current: 'USD',
      component: 'Wallet'
    };
  }

  componentWillMount () {
    const self = this;

    localforage.getItem('currency', function (err, value) {
      if (err) {
        this.setState({
          firstTime: true
        });
        return;
      }
      let newPosition = {};
      if (value === 'GBP') {
        newPosition = {
          styleUSD: '#8c817b',
          styleGBP: '#F4F3EF',
          styleEUR: '#8c817b',
          bluePosition: '8rem',
          current: 'GBP'
        };
      } else if (value === 'EUR') {
        newPosition = {
          styleUSD: '#8c817b',
          styleGBP: '#8c817b',
          styleEUR: '#F4F3EF',
          bluePosition: '16rem',
          current: 'EUR'
        };
      }
      self.setState(newPosition);
    });
    localforage.getItem('app', function (err, value) {
      if (err) { return; }
      let newPosition = {};
      if (value === 'converter') {
        newPosition = {
          stylePiggy: '#8c817b',
          styleConvert: '#F4F3EF',
          styleBank: '#8c817b',
          appBluePosition: '8rem',
          component: 'Converter'
        };
      } else if (value === 'ethBtc') {
        newPosition = {
          stylePiggy: '#8c817b',
          styleConvert: '#8c817b',
          styleBank: '#F4F3EF',
          appBluePosition: '16rem',
          component: 'EthBtc'
        };
      }
      self.setState(newPosition);
    });
  }

  usdClick = (e) => {
    this.setState({
      styleUSD: '#F4F3EF',
      styleGBP: '#8c817b',
      styleEUR: '#8c817b',
      bluePosition: '0rem',
      current: 'USD'
    });
    localforage.setItem('currency', 'USD', function (err) {
      if (err) { console.error; }
    });
  }
  gbpClick = (e) => {
    this.setState({
      styleUSD: '#8c817b',
      styleGBP: '#F4F3EF',
      styleEUR: '#8c817b',
      bluePosition: '8rem',
      current: 'GBP'
    });
    localforage.setItem('currency', 'GBP', function (err) {
      if (err) { console.error; }
    });
  }
  eurClick = (e) => {
    this.setState({
      styleUSD: '#8c817b',
      styleGBP: '#8c817b',
      styleEUR: '#F4F3EF',
      bluePosition: '16rem',
      current: 'EUR'
    });
    localforage.setItem('currency', 'EUR', function (err) {
      if (err) { console.error; }
    });
  }

  switchComponents () {
    const { priceFull, priceMulti, accounts } = Store;
    const { current, component } = this.state;

    switch (component) {
      case 'Converter':
        return (<Converter priceMulti={ priceMulti } current={ current } />);
      case 'EthBtc':
        return (<EthBtc priceFull={ priceFull } current={ current } />);
      case 'Wallet':
      default:
        return (<Wallet accounts={ accounts } priceMulti={ priceMulti } current={ current } />);
    }
  }

  personal = () => {
    this.setState({
      stylePiggy: '#F4F3EF',
      styleConvert: '#8c817b',
      styleBank: '#8c817b',
      appBluePosition: '0rem',
      component: 'Wallet'
    });
    localforage.setItem('app', 'personal', function (err) {
      if (err) { console.error; }
    });
  }

  converter = () => {
    this.setState({
      stylePiggy: '#8c817b',
      styleConvert: '#F4F3EF',
      styleBank: '#8c817b',
      appBluePosition: '8rem',
      component: 'Converter'
    });
    localforage.setItem('app', 'converter', function (err) {
      if (err) { console.error; }
    });
  }

  ethBtc = () => {
    this.setState({
      stylePiggy: '#8c817b',
      styleConvert: '#8c817b',
      styleBank: '#F4F3EF',
      appBluePosition: '16rem',
      component: 'EthBtc'
    });
    localforage.setItem('app', 'ethBtc', function (err) {
      if (err) { console.error; }
    });
  }

  render () {
    const {
      firstTime,
      styleUSD,
      styleGBP,
      styleEUR,
      bluePosition,
      stylePiggy,
      styleConvert,
      styleBank,
      appBluePosition
    } = this.state;

    let popup = null;

    if (firstTime) {
      popup = (
        <div id='popup'>
          <div id='popup-inner'>Click the logo to enter the UI</div>
          <div id='popup-arrow' />
        </div>
      );
    }

    return (
      <div className='App'>
        <div className='header'>

          <a id='logo' href='http://localhost:8180/'>
            <svg viewBox='0 0 200 150'>
              <g>
                <polygon fill='#C7C4BB' points='116.835,39.786 140.608,19.331 170.171,24.218 192.387,49.58 192.865,77.111 178.597,96.849
                163.218,105.498 138.759,108.767 116.681,101.135 137.617,105.621 166.633,98.159 184.517,77.111 180.523,48.554 154.053,34.517
                128.244,45.575 67.446,129.07' />
                <polyline fill='#C7C4BB' points='143.152,43.498 161.953,53.025 170.387,73.688 172.946,55.731 157.613,40.927 143.006,42.607' />
                <polyline fill='#C7C4BB' points='106.074,111.688 133.802,122.279 147.1,123.081 164.528,116.898 175.482,105.229 157.613,118.225
                133.802,120.753 105.477,111.479' />
                <polyline fill='#C7C4BB' points='126.671,23.135 103.978,31.31 49.708,115.241 39.668,123.698 26.028,125.209 5.623,114.162
                19.368,127.021 38.62,129.317 58.157,116.514 107.581,40.846 128.244,23.158' />
                <polyline fill='#C7C4BB' points='22.339,113.129 27.658,117.122 34.808,118.179 45.33,115.742 33.887,117.122 33.887,117.122
                21.43,112.111' />
              </g>
            </svg>
          </a>
          { popup }

          <div className='app-switch'>
            <div className='blue-selected' style={ { left: appBluePosition } } />
            <div className='option' onClick={ this.personal }>
              <svg viewBox='0 0 100 100' fill={ stylePiggy }>
                <polygon points='58.347,14.012 54.88,22.428 43.495,24.903 35.987,16.96 37.584,7.722 46.465,3.121 53.396,4.441 ' />
                <path d='M88.617,54.023l-6.011-1.202l-1.402-7.212l4.408-7.012l-1.002-4.208l-12.422,3.005L62.172,28.98
                l-16.629-1.202l-18.833,5.41L10.482,40.6l-6.01,15.226l3.005,16.83l9.416,7.812l-3.406,14.225l11.62-1.201l1.603-5.91l10.619,2.955
                h13.223l13.423-4.658v8.814h13.022l-2.003-11.82l3.605-5.209h12.422v-9.816l4.007-8.615L88.617,54.023z M59.25,40.909L54,38.833
                l-5.5-2.25l-12.75,1.833l-6.083,1.833l-1.546-1.981l10.396-4.125l9.733-0.825l7.43,1.65l6.57,4.115L59.25,40.909z M74.593,55.626
                l-2.404,2.806l-3.405-4.809l1.803-5.009h1.603l2.404,2.504V55.626z' />
              </svg>
            </div>
            <div className='option' onClick={ this.converter }>
              <svg viewBox='0 0 100 100' fill={ styleConvert }>
                <polyline points='19.132,14.746 24.993,8.873 30.854,3 30.278,7.383 29.701,11.766 29.701,12.204 29.701,12.642
                38.637,13.08 47.572,13.519 59.967,13.08 72.361,12.642 78.031,16.938 83.7,21.232 87.543,26.316 91.386,31.4 92.154,39.991
                92.924,48.582 88.312,49.634 83.7,50.686 77.742,50.334 71.785,49.983 71.496,45.776 71.208,41.569 71.785,36.484 72.361,31.4
                62.369,30.524 52.376,29.648 41.615,30.524 30.854,31.4 30.278,35.695 29.701,39.991 24.993,36.572 20.285,33.154 14.424,27.193
                8.563,22.083 8.563,20 19.132,14.746 ' />
                <polyline points='81.202,85.889 75.342,91.762 69.48,97.635 70.057,93.252 70.634,88.869 70.634,88.432
                70.634,87.993 61.697,87.555 52.762,87.115 40.367,87.555 27.973,87.993 22.304,83.697 16.635,79.402 12.792,74.318 8.948,69.233
                8.179,60.644 7.41,52.054 12.022,51.002 16.635,49.95 22.592,50.301 28.549,50.651 28.837,54.859 29.125,59.066 28.549,64.15
                27.973,69.233 37.965,70.11 47.958,70.987 58.719,70.11 69.48,69.233 70.057,64.938 70.634,60.644 75.342,64.062 80.05,67.481
                91.771,78.792 91.539,79.834 86.486,82.646 81.202,85.889 ' />
              </svg>
            </div>
            <div className='option' onClick={ this.ethBtc }>
              <svg viewBox='0 0 100 100' fill={ styleBank }>
                <polygon points='87,26.625 95.312,29.125 96.543,30.785 95,33.438 93,36.875 81.625,37.188 70.25,37.5
                49.188,36.875 28.125,36.25 11,37.5 8.625,37.5 6.75,34.188 4.46,31.429 5.312,29.25 16.875,23.5 24,20.812 31.125,18.125
                40.812,12.5 50.5,6.875 59,10.312 67.5,13.75 77.25,20.188 ' />
                <polyline points='33.438,42.188 32.219,41.312 24.375,41 16.25,41 14.638,43.394 15,45.188 19.25,45.5 16.875,61.5
                17.5,78.375 13.125,79.875 12.25,82.375 15.375,84.625 46,83.5 69.375,84.625 87.875,83.5 89.25,81.125 87.125,78.375 83.25,78.375
                83.25,61.5 82.5,52.625 82.5,44.812 85.312,44 84.448,41.258 78.625,41 69.375,41.938 69.375,41.625 69,44.062 70.875,44.812
                72.188,46.312 70.875,57.062 70.125,70.75 69.75,78.375 69.75,78.375 57,79.125 57.688,65.375 56.375,50 56.375,44.812
                57.688,44.031 58.75,41.625 56.375,41 46,41.625 43,41 41.75,42.5 43.5,44.375 45.375,45.438 44.5,57.688 45.125,68.375
                43.438,78.75 36.375,79.125 30,78.375 29,62.125 29,50 29,45.5 31.312,44.375 32.938,43.688 ' />
                <polygon points='6.625,90.25 8.75,92.25 30.75,91.5 46.75,92 90.125,92.5 93.125,91.5 94.375,89 92,86.625
                59.5,86.812 36.5,87.375 8.75,86.25 6.625,87.375 ' />
              </svg>
            </div>
          </div>

          <div className='currency-switch'>
            <div className='blue-selected' style={ { left: bluePosition } } />
            <div className='option' onClick={ this.usdClick }>
              <svg viewBox='0 0 100 100'>
                <polyline fill={ styleUSD } points='34.122,82.256 25.607,75.893 33.38,66.89 39.507,71.926 52.97,75.446 62.29,70.269 61.255,60.948
                33.708,48.313 27.626,34.637 33.604,18.902 46.199,13.87 44.685,6.268 47.889,2.708 57.061,2.708 56.685,13.676 67.093,16.653
                73.766,22.145 68.42,30.847 54.73,24.495 44.128,27.64 39.882,34.637 51.184,43.013 71.637,52.663 75.546,68.197 67.733,81.473
                56.49,84.34 57.63,97.155 46.691,96.65 47.889,86.424 34.122,82.256 ' />
              </svg>
            </div>
            <div className='option' onClick={ this.gbpClick }>
              <svg viewBox='0 0 100 100'>
                <polyline fill={ styleGBP } points='20.292,46.481 31.268,47.204 24.257,34.623 26.778,17.479 43.732,4.734 64.96,5.936 76.851,17.479
                79.317,31.783 68.639,31.783 63.986,17.479 50.781,13.125 39.426,17.479 34.99,28.624 41.189,47.204 63.121,45.816 63.121,52.627
                44.154,52.051 46.729,59.567 41.189,73.103 32.556,84.739 37.598,82.04 51.208,80.313 66.929,83.766 76.851,79.054 82.119,88.147
                63.315,94.049 51.652,90.425 37.521,89.597 27.763,94.947 20.292,86.303 27.297,80.313 36.293,65.896 35.25,52.051 18.907,53.203
                18.907,45.816 ' />
              </svg>
            </div>
            <div className='option' onClick={ this.eurClick }>
              <svg viewBox='0 0 100 100'>
                <polygon fill={ styleEUR } points='25.949,53.173 20.746,53.173 17.184,60.847 27.143,60.847 31.398,74.369 41.798,86.226
                63.336,92.684 79.494,89.904 80.689,77.618 76.129,80.761 56.368,82.162 43.18,72.967 38.706,62.062 70.785,60.847 73.811,53.173
                55.401,52.184 38.169,53.173 37.261,45.726 44.065,44.896 76.129,45.726 76.939,38.051 55.401,38.743 38.169,38.051 40.46,30.866
                49.961,19.831 68.68,15.939 79.494,20.712 83.021,11.165 77.277,8.376 62.521,6.583 42.727,12.835 31.398,24.656 26.414,38.743
                20.746,38.051 18.388,45.726 24.795,45.726 ' />
              </svg>
            </div>
          </div>
        </div>

        <div className='content'>
          <div className='left-content col-md-3' />
          <div className='center-content col-md-6'>
            <div className='center-header row'>
              {this.switchComponents()}
            </div>
          </div>
          <div className='right-content col-md-3' />
        </div>
      </div>
    );
  }
}

export default App;
