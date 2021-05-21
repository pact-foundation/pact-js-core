import express = require('express');
import * as http from 'http';
import { returnJson, returnJsonFile, auth } from './data-utils';
import cors = require('cors');
import bodyParser = require('body-parser');

export default (port: number): Promise<http.Server> => {
  const server: express.Express = express();
  server.use(cors());
  server.use(bodyParser.json());
  server.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  let stateData = '';

  server.get('/', returnJson({ greeting: 'Hello' }));

  server.get('/fail', returnJson({ greeting: 'Oh noes!' }));

  server.get(
    '/provider-states',
    returnJson({
      me: ['There is a greeting'],
      anotherclient: ['There is a greeting'],
    })
  );

  server.post(
    '/provider-state',
    (req: express.Request, res: express.Response) => {
      stateData = 'State data!';
      return res.json({
        greeting: stateData,
      });
    }
  );

  server.get('/somestate', (req: express.Request, res: express.Response) => {
    return res.json({
      greeting: stateData,
    });
  });

  server.post('/', (req: express.Request, res: express.Response) => {
    return res.json({
      greeting: `Hello ${req.body.name}`,
    });
  });

  server.get(
    '/contract/:name',
    (req: express.Request, res: express.Response) => {
      const fileName = req.params.name;
      res.sendFile(
        fileName,
        {
          root: __dirname,
          dotfiles: 'deny',
          headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
          },
        },
        err => {
          if (err) {
            console.log(err);
            res.status(500).end();
          } else {
            console.log('Sent:', fileName);
          }
        }
      );
    }
  );

  // Verification result
  server.post(
    '/pacts/provider/:provider/consumer/:consumer/pact-version/:version/verification-results',
    returnJsonFile('./data/get-provider_they-consumer_me-latest.json')
  );
  server.get(
    '/pacts/provider/they/consumer/me/latest',
    auth,
    returnJsonFile('./data/get-provider_they-consumer_me-latest.json')
  );
  server.get(
    '/pacts/provider/they/consumer/anotherclient/latest',
    auth,
    returnJsonFile(
      './data/get-provider_they-consumer_anotherclient-latest.json'
    )
  );
  server.get(
    '/noauth/pacts/provider/they/consumer/me/latest',
    returnJsonFile('./data/get-noauth-provider_they-consumer_me-latest.json')
  );
  server.get(
    '/noauth/pacts/provider/they/consumer/anotherclient/latest',
    returnJsonFile(
      './data/get-noauth-provider_they-consumer_anotherclient-latest.json'
    )
  );

  let s: http.Server;
  return new Promise<void>(resolve => {
    s = server.listen(port, () => resolve());
  }).then(() => s);
};
