import { h, Component } from 'preact';
import '../Stylesheets/Wallet.css';

const formatValue = (value) => ('' + value).replace(/(\d)(?=(\d{3})+$)/g, "$1,");
const parseUpper  = (value) => value.toString().split('.')[0];
const parseLower  = (value) => {
  let n = parseFloat(value.toFixed(2)).toString().split('.')[1];
  if (!n) {
    return '00';
  } else if (n.length === 1) {
    return n + '0';
  }

  return n;
}

class Wallet extends Component {
  render() {
    const { accounts, current, priceMulti } = this.props;

    let totalEth = 0, sign = '$', wallets = null;

    switch (current) {
      case 'USD':
        sign = '$';
        break;
      case 'GBP':
        sign = '£';
        break;
      case 'EUR':
        sign = '€';
        break;
      default:
        sign = '$';
    }

    if (accounts && priceMulti) {
      let accountArray = accounts.sort((a, b) => {
          return parseFloat(b.balance) - parseFloat(a.balance);
      });
      wallets = accountArray.map((account, i) => {
        // account, balance, name
        totalEth += account.balance;
        let value = account.balance * priceMulti['ETH'][current];

        return (
          <div key={i} className="wallet-account">
            <div className="wallet-account-info">
              <div className="wallet-account-svg">
                <svg viewBox="0 0 100 100">
                <path fill="#8C817B" d="M84.032,33.467l-9.986-1.353l-50.572,0.647l-1.983-3.27l36.118-3.203h21.431L78.08,17.28l-5.907-1.827
                	l-55.76,9.171l-0.915,16.021l0.915,22.263l-0.915,18.102l6.948,5.466l48.271-1.305l13.315-1.428l2.488-6.062V40.645L84.032,33.467z
                	 M77.155,64.281l-5.271,1.109l-4.229-4.438l2.114-4.994l4.195-1.665l4.439,3.329L77.155,64.281z"/>
                </svg>
              </div>
              <div className="wallet-account-name">{account.name}</div>
            </div>
            <div className="wallet-account-details">
              <div className="wallet-account-balance">{account.balance.toFixed(4)} ETH</div>
              <div className="wallet-account-value">{sign}{value.toFixed(2)}</div>
            </div>
          </div>
        );
      });
      totalEth = totalEth * priceMulti['ETH'][current];
    }

    if (!accounts) {
      return (
        <div className="Wallet">
          <div className="wallet-accounts">

            <div className="wallet-details">Personal Wallet</div>

            <div className="wallet-body">
              <div className="parity-svg">

              </div>
              <div className="error">No Parity node found</div>
            </div>

          </div>
        </div>
      )
    }

    return (
      <div className="Wallet">
        <div className="wallet-accounts">

          <div className="wallet-details">Personal Wallet</div>

          <div className="wallet-body">
            <div className="w-amount">
              <span className="w-lower">{sign}</span>
              <span className="w-upper">{formatValue(parseUpper(totalEth))}</span>
              <span className="w-period">.</span>
              <span className="w-lower">{formatValue(parseLower(totalEth))}</span>
            </div>
            <div className="wallet-account-total">Total Balance</div>

            <div className="wallet-accounts">
              <div className="wallet-accounts-container">
                {wallets}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default Wallet;
