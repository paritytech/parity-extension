import { h, Component } from 'preact';
import '../Stylesheets/Converter.css';

const formatValue = (value) => ('' + value).replace(/(\d)(?=(\d{3})+$)/g, "$1,");
const parseUpper  = (value) => value.toString().split('.')[0];
const parseLower  = (value) => {
  let n = parseFloat(value.toFixed(5)).toString().split('.')[1];
  if (!n) {
    return '00';
  } else if (n.length === 1) {
    return n + '0';
  }

  return n;
}

class Converter extends Component {
  constructor() {
    super();

    this.state = {
      value: 1.00
    }
  }

  inputChange = (event) => {
    this.setState({value: event.target.value});
    this.forceUpdate();
  }

  render() {
    const { priceMulti, current } = this.props;
    const { value } = this.state;
    let usd, gbp, eur, btc, eth;

    if (priceMulti && current) {
      usd = value * priceMulti[current]['USD'];
      gbp = value * priceMulti[current]['GBP'];
      eur = value * priceMulti[current]['EUR'];
      btc = value * priceMulti[current]['BTC'];
      eth = value * priceMulti[current]['ETH'];
    }

    return (
      <div className="Converter">
        <div className="converter-header">Converter</div>
        <div className="converter-component">
          <div className="converter-body">
            <div id="converter-input-container">
              <input type="text" value={value} id="converter-input" onInput={this.inputChange} />
            </div>
            <div id="convert-main">
              <div className="c-type">
                <div className="c-svg">
                  <svg viewBox="0 0 100 100">
                    <polyline fill="#787c87" points="34.122,82.256 25.607,75.893 33.38,66.89 39.507,71.926 52.97,75.446 62.29,70.269 61.255,60.948
                    33.708,48.313 27.626,34.637 33.604,18.902 46.199,13.87 44.685,6.268 47.889,2.708 57.061,2.708 56.685,13.676 67.093,16.653
                    73.766,22.145 68.42,30.847 54.73,24.495 44.128,27.64 39.882,34.637 51.184,43.013 71.637,52.663 75.546,68.197 67.733,81.473
                    56.49,84.34 57.63,97.155 46.691,96.65 47.889,86.424 34.122,82.256 "/>
                  </svg>
                </div>
                <div className="c-amount">
                  <span className="c-upper">{usd ? formatValue(parseUpper(usd)) : 0}</span>
                  <span className="c-period">.</span>
                  <span className="c-lower">{usd ? parseLower(usd) : '00'}</span>
                </div>
              </div>
              <div className="c-type">
                <div className="c-svg">
                  <svg viewBox="0 0 100 100">
                    <polyline fill="#787c87" points="20.292,46.481 31.268,47.204 24.257,34.623 26.778,17.479 43.732,4.734 64.96,5.936 76.851,17.479
                    79.317,31.783 68.639,31.783 63.986,17.479 50.781,13.125 39.426,17.479 34.99,28.624 41.189,47.204 63.121,45.816 63.121,52.627
                    44.154,52.051 46.729,59.567 41.189,73.103 32.556,84.739 37.598,82.04 51.208,80.313 66.929,83.766 76.851,79.054 82.119,88.147
                    63.315,94.049 51.652,90.425 37.521,89.597 27.763,94.947 20.292,86.303 27.297,80.313 36.293,65.896 35.25,52.051 18.907,53.203
                    18.907,45.816 "/>
                  </svg>
                </div>
                <div className="c-amount">
                  <span className="c-upper">{gbp ? formatValue(parseUpper(gbp)) : 0}</span>
                  <span className="c-period">.</span>
                  <span className="c-lower">{gbp ? parseLower(gbp) : '00'}</span>
                </div>
              </div>
              <div className="c-type">
                <div className="c-svg">
                  <svg viewBox="0 0 100 100">
                    <polygon fill="#787c87" points="25.949,53.173 20.746,53.173 17.184,60.847 27.143,60.847 31.398,74.369 41.798,86.226
                    63.336,92.684 79.494,89.904 80.689,77.618 76.129,80.761 56.368,82.162 43.18,72.967 38.706,62.062 70.785,60.847 73.811,53.173
                    55.401,52.184 38.169,53.173 37.261,45.726 44.065,44.896 76.129,45.726 76.939,38.051 55.401,38.743 38.169,38.051 40.46,30.866
                    49.961,19.831 68.68,15.939 79.494,20.712 83.021,11.165 77.277,8.376 62.521,6.583 42.727,12.835 31.398,24.656 26.414,38.743
                    20.746,38.051 18.388,45.726 24.795,45.726 "/>
                  </svg>
                </div>
                <div className="c-amount">
                  <span className="c-upper">{eur ? formatValue(parseUpper(eur)) : 0}</span>
                  <span className="c-period">.</span>
                  <span className="c-lower">{eur ? parseLower(eur) : '00'}</span>
                </div>
              </div>
            </div>
            <div id="convert-crypto">
              <div className="c-type">
                <div className="c-svg">
                  <svg viewBox="0 0 100 100">
                    <path fill="#787c87" d="M79.52,53.022l-9.139-5.347l5.743-5.648l0.778-10.126l-7.82-8.824l-10.335-2.473L57.732,8.287l-8.053-1.004
                      v12.873l-6.429,0.081l1.769-12.954h-8.936L35.197,20.5l-14.641,1.502l-1.6,8.31l10.275-1.038l1.938,19.531l-1.938,20.898
                      l-8.675,1.819l-1.596,9.605l16.234,0.054L35.2,94.549h8.046l-0.93-14.368l8.188-1.122l-0.825,15.49h6.145l1.921-13.354l17.209-4.274
                      l7.103-10.661L79.52,53.022z M44.332,28.691l5.313-0.071l10.143,2.097l3.376,6.01l-4.675,6.497l-15.074,1.874L44.332,28.691z
                       M64.239,67.829l-7.725,2.854l-12.189,0.487l-0.91-17.709h0.917l17.235,1.624l5.351,7.23L64.239,67.829z"/>
                  </svg>
                </div>
                <div className="c-amount">
                  <span className="c-upper">{btc ? formatValue(parseUpper(btc)) : 0}</span>
                  <span className="c-period">.</span>
                  <span className="c-lower">{btc ? parseLower(btc) : '00'}</span>
                </div>
              </div>
              <div className="c-type">
                <div className="c-svg">
                  <svg viewBox="0 0 100 100">
                    <g>
                      <polyline fill="#787c87" points="22.104,52.896 32.647,48.97 50.324,40.071 62.315,44.214 78.541,52.896 65.264,33.896
                        50.324,6.073 43.519,20.998 22.104,52.896 	"/>
                      <polygon fill="#787c87" points="78.564,58.252 64.158,66.324 49.979,78.134 36.517,69.825 22.104,58.252 44.44,85.486
                        50.324,95.989 64.445,77.12 	"/>
                      <polygon fill="#787c87" points="44.417,65.311 25.306,54.129 40.363,48.915 49.564,42.187 60.266,48.915 75.363,53.225
                        49.564,70.378 	"/>
                    </g>
                  </svg>
                </div>
                <div className="c-amount">
                  <span className="c-upper">{eth ? formatValue(parseUpper(eth)) : 0}</span>
                  <span className="c-period">.</span>
                  <span className="c-lower">{eth ? parseLower(eth) : '00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Converter;
