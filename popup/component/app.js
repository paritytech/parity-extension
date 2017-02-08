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

import classnames from 'classnames';
import { h, Component } from 'preact';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import Config from '../../background/config';
import Extractions from './extractions';

import styles from './app.css';

export default class App extends Component {

  state = {
    augmentationEnabled: true,
    extractions: []
  };

  componentWillMount () {
    Config.get()
      .then((config) => {
        const { augmentationEnabled } = config;

        this.setState({ augmentationEnabled });
      });

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
    const { augmentationEnabled, extractions } = this.state;

    const status = 'disconnected';
    const url = 'http://localhost:8545/';

    return (
      <div className={ styles.container }>
        <div className={ styles.header }>
          <h1 className={ styles.title }>Web3 Injection</h1>
        </div>

        { this.renderExtractions(augmentationEnabled, extractions) }

        { this.renderStatus(status, url) }
      </div>
    );
  }

  renderExtractions (augmentationEnabled, extractions) {
    if (!augmentationEnabled) {
      return null;
    }

    return (
      <Extractions
        extractions={ extractions }
      />
    );
  }

  renderStatus (status, url) {
    const iconClassName = classnames({
      [ styles.statusIcon ]: true,
      [ styles.connected ]: status === 'connected',
      [ styles.connecting ]: status === 'connecting',
      [ styles.disconnected ]: status === 'disconnected'
    });

    let phrase;

    switch (status) {
      case 'connected':
        phrase = 'Connected to';
        break;

      case 'connecting':
        phrase = 'Connecting to';
        break;

      case 'disconnected':
      default:
        phrase = 'Not connected to';
        break;
    }

    return (
      <div className={ styles.status }>
        <span className={ iconClassName } />
        <span>{ phrase } { url }</span>
      </div>
    );
  }

}
