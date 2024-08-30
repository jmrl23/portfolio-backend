import ms from 'ms';
import { asRoute } from '../lib/common';

export default asRoute(async function (app) {
  app.route({
    method: 'GET',
    url: '/ping',
    config: {
      rateLimit: {
        max: 10,
        timeWindow: ms('5m'),
      },
    },
    schema: {
      hide: true,
    },
    handler() {
      return 'pong';
    },
  });
});
