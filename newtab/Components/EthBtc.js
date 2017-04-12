import { h, Component } from 'preact';
import '../Stylesheets/EthBtc.css';

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

class EthBtc extends Component {
  constructor() {
    super();

    this.state = {
      eth:          "#F4F3EF",
      btc:          "#8c817b",
      bluePosition: "0rem",
      coin:         "ETH"
    }
  }

  ethClick = (e) => {
    this.setState({
      eth:          "#F4F3EF",
      btc:          "#8c817b",
      bluePosition: "0rem",
      coin:         "ETH"
    });
  }
  btcClick = (e) => {
    this.setState({
      eth:          "#8c817b",
      btc:          "#F4F3EF",
      bluePosition: "7rem",
      coin:         "BTC"
    });
  }

  render() {
    const { eth, btc, bluePosition, coin } = this.state;
    const { priceFull, current } = this.props;

    let market = null;
    if (priceFull)
      market = priceFull[coin][current];

    return (
      <div className="EthBtc">

        <div className="eth-btc-header">
          <div className="exchange-details">Exchange Details</div>
          <div className="coin-switch">
            <div className="blue-selected-coin" style={{ left: bluePosition }} />
            <div id="eth-svg" onClick={this.ethClick}>
              <svg viewBox="0 0 100 100">
              	<polyline fill={eth} points="32.127,51.182 38.802,48.694 49.994,43.06 57.585,45.683 67.861,51.182 59.451,39.15
              		49.994,21.534 45.685,30.983 32.127,51.182 	"/>
              	<polygon fill={eth} points="67.873,54.57 58.751,59.684 49.775,67.16 41.252,61.9 32.127,54.57 46.269,71.816 49.994,78.467
              		58.934,66.518 	"/>
              	<polygon fill={eth} points="46.254,59.041 34.153,51.963 43.688,48.66 49.514,44.4 56.287,48.66 65.846,51.389 49.514,62.25
              		"/>
                <path fill={eth} stroke="none" d="M59.504,98.249
                	L86.011,81.88l11.417-30.637l-3.198-17.377L86.271,19.22L58.182,1.751L13.813,17.598L2.572,44.415l19.552,45.396L59.504,98.249z
                	 M26.631,18.856l25.931-7.906l13.065,3.004l12.031,7.42l11.728,23.618L84.298,70.22L58.53,88.749L20.872,76.28l-9.57-21.445
                	L26.631,18.856z"/>
              </svg>
            </div>
            <div id="btc-svg" onClick={this.btcClick}>
              <svg viewBox="0 0 100 100">
                <path fill={btc} d="M66.104,51.169l-5.071-2.967l3.187-3.135l0.429-5.621l-4.336-4.898l-5.738-1.372l-0.562-6.837l-4.47-0.557
                	l-0.001,7.146l-3.568,0.045l0.981-7.19h-4.959l-0.492,7.337l-8.126,0.832l-0.889,4.613l5.704-0.576l1.074,10.841l-1.074,11.6
                	l-4.815,1.01l-0.887,5.33l9.011,0.029l0.004,7.42h4.466l-0.516-7.973l4.545-0.623l-0.459,8.596h3.411l1.063-7.41l9.556-2.371
                	l3.942-5.918L66.104,51.169z M46.571,37.664l2.95-0.038l5.632,1.164l1.871,3.336l-2.596,3.605l-8.365,1.04L46.571,37.664z
                	 M57.623,59.39l-4.289,1.58l-6.765,0.273l-0.506-9.83h0.508l9.566,0.902l2.97,4.012L57.623,59.39z"/>
                <path fill={btc} stroke="none" d="M82.429,13.915
                	L53.671,1.931l-31.544,8.597L9.878,23.261L2.623,38.268l2.194,33.006l38.751,26.796l28.34-6.512l25.469-42.36L82.429,13.915z
                	 M37.114,86.924L15.568,70.473l-5.182-12.365l-0.991-14.1L21.74,20.706l23.459-10.583l30.08,10.123l11.838,37.861L75.279,78.39
                	L37.114,86.924z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="eth-btc-body">

          <div className="eth-btc-topic">
            <div className="eth-btc-topic-title">Price</div>
            <div className="eth-btc-topic-value">
              {market
                ? formatValue(parseUpper(market.PRICE)) + '.' + parseLower(market.PRICE)
                : '0.00'
              }
            </div>
          </div>

          <div className="eth-btc-topic">
            <div className="eth-btc-topic-title">Market Cap</div>
            <div className="eth-btc-topic-value">{market ? formatValue(parseInt(market.MKTCAP, 10)) : '0'}</div>
          </div>

          <div className="eth-btc-topic">
            <div className="eth-btc-topic-title">Supply</div>
            <div className="eth-btc-topic-value">{market ? formatValue(parseInt(market.SUPPLY, 10)) : '0'}</div>
          </div>

          <div className="eth-btc-topic">
            <div className="eth-btc-topic-title">Volume (24h)</div>
            <div className="eth-btc-topic-value">{market ? formatValue(parseInt(market.VOLUME24HOURTO, 10)) : '0'}</div>
          </div>

        </div>
      </div>
    );
  }
}

export default EthBtc;
