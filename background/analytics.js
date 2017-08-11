import analytics from 'universal-ga';

import Config from './config';
import { isProd } from '../shared';

const trackingId = 'UA-77071647-4';

Config.get()
  .then(config => {
    if (!config.analyticsEnabled) {
      return;
    }

    // initialize
    analytics.initialize(trackingId, {
      debug: !isProd,
      clientId: config.clientId
    });
    // Disable protocol check
    analytics.set('checkProtocolTask', null);
    analytics.set('dimension1', config.lastVersion);
    analytics.set('dimension2', config.lastChain);
    analytics.pageview('/run');
  });

analytics.ifEnabled = (fn, config = null) => {
  const cfg = config || Config.get();
  cfg.then(config => {
    if (config.analyticsEnabled) {
      fn();
    }
  });
};
export default analytics;
