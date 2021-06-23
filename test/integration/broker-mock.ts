import express = require('express');
import * as http from 'http';
import { auth, returnJson } from './data-utils';
import cors = require('cors');
import _ = require('underscore');
import bodyParser = require('body-parser');

export default (port: number): Promise<http.Server> => {
  const BROKER_HOST = `http://localhost:${port}`;
  const server: express.Express = express();
  server.use(cors());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  function pactFunction(
    req: express.Request,
    res: express.Response
  ): express.Response {
    if (
      _.isEmpty(req.body) ||
      // 2. Is there a consumer, provider and version in the request?
      _.isEmpty(req.params.consumer) ||
      _.isEmpty(req.params.provider) ||
      _.isEmpty(req.params.version)
    ) {
      return res.sendStatus(400);
    }
    return res.status(201).json({
      consumer: { name: 'consumer' },
      provider: { name: 'publisher' },
      interactions: [
        {
          description: 'Greeting',
          request: { method: 'GET', path: '/' },
          response: { status: 200, headers: {}, body: { greeting: 'Hello' } },
        },
      ],
      metadata: { pactSpecificationVersion: '2.0.0' },
      createdAt: '2017-11-06T13:06:48+00:00',
      _links: {
        self: {
          title: 'Pact',
          name: 'Pact between consumer (v1.0.0) and publisher',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/version/1.0.0`,
        },
        'pb:consumer': {
          title: 'Consumer',
          name: 'consumer',
          href: `${BROKER_HOST}/pacticipants/consumer`,
        },
        'pb:consumer-version': {
          title: 'Consumer version',
          name: '1.0.0',
          href: `${BROKER_HOST}/pacticipants/consumer/versions/1.0.0`,
        },
        'pb:provider': {
          title: 'Provider',
          name: 'publisher',
          href: `${BROKER_HOST}/pacticipants/publisher`,
        },
        'pb:latest-pact-version': {
          title: 'Latest version of this pact',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/latest`,
        },
        'pb:all-pact-versions': {
          title: 'All version of this pact',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/versions`,
        },
        'pb:latest-untagged-pact-version': {
          title: 'Latest untagged version of this pact',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/latest-untagged`,
        },
        'pb:latest-tagged-pact-version': {
          title: 'Latest tagged version of this pact',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/latest/{tag}`,
          templated: true,
        },
        'pb:previous-distinct': {
          title: 'Previous distinct version of this pact',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/version/1.0.0/previous-distinct`,
        },
        'pb:diff-previous-distinct': {
          title: 'Diff with previous distinct version of this pact',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/version/1.0.0/diff/previous-distinct`,
        },
        'pb:pact-webhooks': {
          title: 'Webhooks for the pact between consumer and publisher',
          href: `${BROKER_HOST}/webhooks/provider/publisher/consumer/consumer`,
        },
        'pb:tag-prod-version': {
          title:
            "PUT to this resource to tag this consumer version as 'production'",
          href: `${BROKER_HOST}/pacticipants/consumer/versions/1.0.0/tags/prod`,
        },
        'pb:tag-version': {
          title: 'PUT to this resource to tag this consumer version',
          href: `${BROKER_HOST}/pacticipants/consumer/versions/1.0.0/tags/{tag}`,
        },
        'pb:publish-verification-results': {
          title: 'Publish verification results',
          href: `${BROKER_HOST}/pacts/provider/publisher/consumer/consumer/pact-version/7c36fc0ded24117ec189db3f54fadffc23a56d68/verification-results`,
        },
        curies: [
          { name: 'pb', href: `${BROKER_HOST}/doc/{rel}`, templated: true },
        ],
      },
    });
  }

  function tagPactFunction(
    req: express.Request,
    res: express.Response
  ): express.Response {
    if (
      _.isEmpty(req.params.consumer) ||
      _.isEmpty(req.params.version) ||
      _.isEmpty(req.params.tag)
    ) {
      return res.sendStatus(400);
    }
    return res.sendStatus(201);
  }

  server.get('/somebrokenpact', returnJson({}));

  server.get(
    '/somepact',
    returnJson({
      consumer: {
        name: 'anotherclient',
      },
      provider: {
        name: 'they',
      },
    })
  );

  // Pretend to be a Pact Broker (https://github.com/bethesque/pact_broker) for integration tests
  server.put(
    '/pacts/provider/:provider/consumer/:consumer/version/:version',
    pactFunction
  );

  // Authenticated calls...
  server.put(
    '/auth/pacts/provider/:provider/consumer/:consumer/version/:version',
    auth,
    pactFunction
  );

  // Tagging
  server.put(
    '/pacticipant/:consumer/version/:version/tags/:tag',
    tagPactFunction
  );
  server.put(
    '/auth/pacticipant/:consumer/version/:version/tags/:tag',
    tagPactFunction
  );

  // Matrix
  server.get('/matrix', (req: express.Request, res: express.Response) => {
    if (req.query.q[0].pacticipant === 'Foo') {
      return res.json({
        summary: {
          deployable: true,
          reason: 'some text',
          unknown: 1,
        },
        matrix: [
          {
            consumer: {
              name: 'Foo',
              version: {
                number: '4',
              },
            },
            provider: {
              name: 'Bar',
              version: {
                number: '5',
              },
            },
            verificationResult: {
              verifiedAt: '2017-10-10T12:49:04+11:00',
              success: true,
            },
            pact: {
              createdAt: '2017-10-10T12:49:04+11:00',
            },
          },
        ],
      });
    } else {
      return res.json({
        summary: {
          deployable: false,
          reason: 'some text',
          unknown: 1,
        },
        matrix: [
          {
            consumer: {
              name: 'FooFail',
              version: {
                number: '4',
              },
            },
            provider: {
              name: 'Bar',
              version: {
                number: '5',
              },
            },
            verificationResult: {
              verifiedAt: '2017-10-10T12:49:04+11:00',
              success: false,
            },
            pact: {
              createdAt: '2017-10-10T12:49:04+11:00',
            },
          },
        ],
      });
    }
  });

  // Get root HAL links
  server.get(
    '/',
    returnJson({
      _links: {
        self: {
          href: BROKER_HOST,
          title: 'Index',
          templated: false,
        },
        'pb:publish-pact': {
          href: `${BROKER_HOST}/pacts/provider/{provider}/consumer/{consumer}/version/{consumerApplicationVersion}`,
          title: 'Publish a pact',
          templated: true,
        },
        'pb:latest-pact-versions': {
          href: `${BROKER_HOST}/pacts/latest`,
          title: 'Latest pact version',
          templated: false,
        },
        'pb:pacticipants': {
          href: `${BROKER_HOST}/pacticipants`,
          title: 'Pacticipants',
          templated: false,
        },
        'pb:latest-provider-pacts': {
          href: `${BROKER_HOST}/pacts/provider/{provider}/latest`,
          title: 'Latest pacts by provider',
          templated: true,
        },
        'pb:latest-provider-pacts-with-tag': {
          href: `${BROKER_HOST}/pacts/provider/{provider}/latest/{tag}`,
          title: 'Latest pacts by provider with a specified tag',
          templated: true,
        },
        'pb:webhooks': {
          href: `${BROKER_HOST}/webhooks`,
          title: 'Webhooks',
          templated: false,
        },
        curies: [
          {
            name: 'pb',
            href: `${BROKER_HOST}/doc/{rel}`,
            templated: true,
          },
        ],
      },
    })
  );

  // Get pacts by Provider "notfound"
  server.get(
    '/pacts/provider/notfound/latest',
    (req: express.Request, res: express.Response) => res.sendStatus(404)
  );

  // Get pacts by Provider "nolinks"
  server.get(
    '/pacts/provider/nolinks/latest',
    returnJson({
      _links: {
        self: {
          href: `${BROKER_HOST}/pacts/provider/nolinks/latest/sit4`,
          title: 'Latest pact version for the provider nolinks with tag "sit4"',
        },
        provider: {
          href: `${BROKER_HOST}/pacticipants/nolinks`,
          title: 'bobby',
        },
        pacts: [],
      },
    })
  );

  // Get pacts by Provider (all)
  server.get(
    '/pacts/provider/:provider/latest',
    returnJson({
      _links: {
        self: {
          href: `${BROKER_HOST}/pacts/provider/bobby/latest/sit4`,
          title: 'Latest pact version for the provider bobby with tag "sit4"',
        },
        provider: {
          href: `${BROKER_HOST}/pacticipants/bobby`,
          title: 'bobby',
        },
        pacts: [
          {
            href: `${BROKER_HOST}/pacts/provider/bobby/consumer/billy/version/1.0.0`,
            title: 'Pact between billy (v1.0.0) and bobby',
            name: 'billy',
          },
          {
            href: `${BROKER_HOST}/pacts/provider/bobby/consumer/someotherguy/version/1.0.0`,
            title: 'Pact between someotherguy (v1.0.0) and bobby',
            name: 'someotherguy',
          },
        ],
      },
    })
  );

  // Get pacts by Provider and Tag
  server.get(
    '/pacts/provider/:provider/latest/:tag',
    returnJson({
      _links: {
        self: {
          href: 'https://test.pact.dius.com.au/pacts/provider/notfound/latest',
          title: 'Latest pact version for the provider bobby',
        },
        provider: {
          href: 'https://test.pact.dius.com.au/pacticipant/bobby',
          title: 'bobby',
        },
        pacts: [
          {
            href: 'https://test.pact.dius.com.au/pacts/provider/bobby/consumer/billy/version/1.0.0',
            title: 'Pact between billy (v1.0.0) and bobby',
            name: 'billy',
          },
          {
            href: 'https://test.pact.dius.com.au/pacts/provider/bobby/consumer/someotherguy/version/1.0.0',
            title: 'Pact between someotherguy (v1.0.0) and bobby',
            name: 'someotherguy',
          },
        ],
      },
    })
  );

  server.get(
    '/noauth/pacts/provider/they/consumer/me/latest',
    returnJson({
      consumer: {
        name: 'me',
      },
      provider: {
        name: 'they',
      },
      interactions: [
        {
          description: 'Provider state success',
          providerState: 'There is a greeting',
          request: {
            method: 'GET',
            path: '/somestate',
          },
          response: {
            status: 200,
            headers: {},
            body: {
              greeting: 'State data!',
            },
          },
        },
      ],
      metadata: {
        pactSpecificationVersion: '2.0.0',
      },
      updatedAt: '2016-05-15T00:09:33+00:00',
      createdAt: '2016-05-15T00:09:06+00:00',
      _links: {
        self: {
          title: 'Pact',
          name: 'Pact between me (v1.0.0) and they',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/version/1.0.0`,
        },
        'pb:consumer': {
          title: 'Consumer',
          name: 'me',
          href: `${BROKER_HOST}/pacticipants/me`,
        },
        'pb:provider': {
          title: 'Provider',
          name: 'they',
          href: `${BROKER_HOST}/pacticipants/they`,
        },
        'pb:latest-pact-version': {
          title: 'Pact',
          name: 'Latest version of this pact',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/latest`,
        },
        'pb:previous-distinct': {
          title: 'Pact',
          name: 'Previous distinct version of this pact',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct`,
        },
        'pb:diff-previous-distinct': {
          title: 'Diff',
          name: 'Diff with previous distinct version of this pact',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct`,
        },
        'pb:pact-webhooks': {
          title: 'Webhooks for the pact between me and they',
          href: `${BROKER_HOST}/webhooks/provider/they/consumer/me`,
        },
        'pb:tag-prod-version': {
          title: 'Tag this version as "production"',
          href: `${BROKER_HOST}/pacticipants/me/versions/1.0.0/tags/prod`,
        },
        'pb:tag-version': {
          title: 'Tag version',
          href: `${BROKER_HOST}/pacticipants/me/versions/1.0.0/tags/{tag}`,
        },
        curies: [
          {
            name: 'pb',
            href: `${BROKER_HOST}/doc/{rel}`,
            templated: true,
          },
        ],
      },
    })
  );

  server.get(
    '/noauth/pacts/provider/they/consumer/anotherclient/latest',
    returnJson({
      consumer: {
        name: 'anotherclient',
      },
      provider: {
        name: 'they',
      },
      interactions: [
        {
          description: 'Provider state success',
          providerState: 'There is a greeting',
          request: {
            method: 'GET',
            path: '/somestate',
          },
          response: {
            status: 200,
            headers: {},
            body: {
              greeting: 'State data!',
            },
          },
        },
      ],
      metadata: {
        pactSpecificationVersion: '2.0.0',
      },
      updatedAt: '2016-05-15T00:09:33+00:00',
      createdAt: '2016-05-15T00:09:06+00:00',
      _links: {
        self: {
          title: 'Pact',
          name: 'Pact between me (v1.0.0) and they',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/version/1.0.0`,
        },
        'pb:consumer': {
          title: 'Consumer',
          name: 'anotherclient',
          href: `${BROKER_HOST}/pacticipants/me`,
        },
        'pb:provider': {
          title: 'Provider',
          name: 'they',
          href: `${BROKER_HOST}/pacticipants/they`,
        },
        'pb:latest-pact-version': {
          title: 'Pact',
          name: 'Latest version of this pact',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/latest`,
        },
        'pb:previous-distinct': {
          title: 'Pact',
          name: 'Previous distinct version of this pact',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct`,
        },
        'pb:diff-previous-distinct': {
          title: 'Diff',
          name: 'Diff with previous distinct version of this pact',
          href: `${BROKER_HOST}/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct`,
        },
        'pb:pact-webhooks': {
          title: 'Webhooks for the pact between me and they',
          href: `${BROKER_HOST}/webhooks/provider/they/consumer/me`,
        },
        'pb:tag-prod-version': {
          title: 'Tag this version as "production"',
          href: `${BROKER_HOST}/pacticipants/me/versions/1.0.0/tags/prod`,
        },
        'pb:tag-version': {
          title: 'Tag version',
          href: `${BROKER_HOST}/pacticipants/me/versions/1.0.0/tags/{tag}`,
        },
        curies: [
          {
            name: 'pb',
            href: `${BROKER_HOST}/doc/{rel}`,
            templated: true,
          },
        ],
      },
    })
  );

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, () => resolve());
  }).then(() => s);
};
