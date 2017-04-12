import { h, Component } from 'preact';
import { observer } from 'mobx-observer';
import './App.css';

import {
  Converter,
  EthBtc,
  Wallet
} from './Components';

import Store from './Store';

@observer
class App extends Component {
  constructor() {
    super();
    this.state = {
      styleUSD:     "#FCFEFC",
      styleGBP:     "#8c817b",
      styleEUR:     "#8c817b",
      bluePosition: "0rem",
      current:      "USD"
    }
  }

  usdClick = (e) => {
    this.setState({
      styleUSD:     "#F4F3EF",
      styleGBP:     "#8c817b",
      styleEUR:     "#8c817b",
      bluePosition: "0rem",
      current:      "USD"
    });
  }
  gbpClick = (e) => {
    this.setState({
      styleUSD:     "#8c817b",
      styleGBP:     "#F4F3EF",
      styleEUR:     "#8c817b",
      bluePosition: "8rem",
      current:      "GBP"
    });
  }
  eurClick = (e) => {
    this.setState({
      styleUSD:     "#8c817b",
      styleGBP:     "#8c817b",
      styleEUR:     "#F4F3EF",
      bluePosition: "16rem",
      current:      "EUR"
    });
  }

  render() {
    const { priceFull, priceMulti, accounts } = Store;
    const { styleUSD, styleGBP, styleEUR, bluePosition, current } = this.state;
    return (
      <div className="App">
        <div className="header">
          <div id="logo">
            <svg viewBox="0 0 200 150">
              <g>
              <polygon fill="#C7C4BB" points="116.835,39.786 140.608,19.331 170.171,24.218 192.387,49.58 192.865,77.111 178.597,96.849
                163.218,105.498 138.759,108.767 116.681,101.135 137.617,105.621 166.633,98.159 184.517,77.111 180.523,48.554 154.053,34.517
                128.244,45.575 67.446,129.07 	"/>
              <polyline fill="#C7C4BB" points="143.152,43.498 161.953,53.025 170.387,73.688 172.946,55.731 157.613,40.927 143.006,42.607 	"/>
              <polyline fill="#C7C4BB" points="106.074,111.688 133.802,122.279 147.1,123.081 164.528,116.898 175.482,105.229 157.613,118.225
                133.802,120.753 105.477,111.479 	"/>
              <polyline fill="#C7C4BB" points="126.671,23.135 103.978,31.31 49.708,115.241 39.668,123.698 26.028,125.209 5.623,114.162
                19.368,127.021 38.62,129.317 58.157,116.514 107.581,40.846 128.244,23.158 	"/>
              <polyline fill="#C7C4BB" points="22.339,113.129 27.658,117.122 34.808,118.179 45.33,115.742 33.887,117.122 33.887,117.122
                21.43,112.111 	"/>
              </g>
            </svg>
          </div>
          <div className="currency-switch">
            <div className="blue-selected" style={{ left: bluePosition }} />
            <div className="option-usd" onClick={this.usdClick}>
              <svg viewBox="0 0 100 100">
                <polyline fill={styleUSD} points="34.122,82.256 25.607,75.893 33.38,66.89 39.507,71.926 52.97,75.446 62.29,70.269 61.255,60.948
                33.708,48.313 27.626,34.637 33.604,18.902 46.199,13.87 44.685,6.268 47.889,2.708 57.061,2.708 56.685,13.676 67.093,16.653
                73.766,22.145 68.42,30.847 54.73,24.495 44.128,27.64 39.882,34.637 51.184,43.013 71.637,52.663 75.546,68.197 67.733,81.473
                56.49,84.34 57.63,97.155 46.691,96.65 47.889,86.424 34.122,82.256 "/>
              </svg>
            </div>
            <div className="option-gbp" onClick={this.gbpClick}>
              <svg viewBox="0 0 100 100">
                <polyline fill={styleGBP} points="20.292,46.481 31.268,47.204 24.257,34.623 26.778,17.479 43.732,4.734 64.96,5.936 76.851,17.479
                79.317,31.783 68.639,31.783 63.986,17.479 50.781,13.125 39.426,17.479 34.99,28.624 41.189,47.204 63.121,45.816 63.121,52.627
                44.154,52.051 46.729,59.567 41.189,73.103 32.556,84.739 37.598,82.04 51.208,80.313 66.929,83.766 76.851,79.054 82.119,88.147
                63.315,94.049 51.652,90.425 37.521,89.597 27.763,94.947 20.292,86.303 27.297,80.313 36.293,65.896 35.25,52.051 18.907,53.203
                18.907,45.816 "/>
              </svg>
            </div>
            <div className="option-eur" onClick={this.eurClick}>
              <svg viewBox="0 0 100 100">
                <polygon fill={styleEUR} points="25.949,53.173 20.746,53.173 17.184,60.847 27.143,60.847 31.398,74.369 41.798,86.226
                63.336,92.684 79.494,89.904 80.689,77.618 76.129,80.761 56.368,82.162 43.18,72.967 38.706,62.062 70.785,60.847 73.811,53.173
                55.401,52.184 38.169,53.173 37.261,45.726 44.065,44.896 76.129,45.726 76.939,38.051 55.401,38.743 38.169,38.051 40.46,30.866
                49.961,19.831 68.68,15.939 79.494,20.712 83.021,11.165 77.277,8.376 62.521,6.583 42.727,12.835 31.398,24.656 26.414,38.743
                20.746,38.051 18.388,45.726 24.795,45.726 "/>
              </svg>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="left-content col-md-4">
            <EthBtc priceFull={priceFull} current={current} />
          </div>
          <div className="center-content col-md-4">
            <div className="center-header row">
              <Converter priceMulti={priceMulti} current={current} />
            </div>
          </div>
          <div className="right-content col-md-4">
            <Wallet accounts={accounts} priceMulti={priceMulti} current={current} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
