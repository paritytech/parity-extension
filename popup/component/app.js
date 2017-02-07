// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { h, Component } from 'preact';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import Extractions from './extractions';

import styles from './app.css';

export default class App extends Component {

  state = {
    extractions: []
  };

  componentWillMount () {
    this.getExtractions();

    // Trigger when the pop-up is open
    window.onload = () => {
      this.getExtractions();
    };
  }

  getExtractions () {
    chrome.runtime.sendMessage({ action: 'getExtractions' }, (extractions) => {
      this.setState({ extractions });
    });
  }

  render () {
    const { extractions } = this.state;

    return (
      <div className={ styles.container }>
        <div className={ styles.header }>
          <h1 className={ styles.title }>Web3 Injection</h1>
        </div>

        <Extractions
          extractions={ extractions }
        />

        <div className={ styles.status }>
          Connected to http://localhost:8545/
        </div>
      </div>
    );
  }

}
