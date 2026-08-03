import * as net from 'node:net';
import * as path from 'node:path';
import axios from 'axios';
import {
  type ConsumerMessagePact,
  type ConsumerPact,
  makeConsumerMessagePact,
  makeConsumerPact,
} from '../src';
import { FfiSpecificationVersion } from '../src/ffi/types';

const parseMattMessage = (raw: string): string =>
  raw.replace(/(MATT)+/g, '').trim();
const generateMattMessage = (raw: string): string => `MATT${raw}MATT`;

const CONNECT_TIMEOUT_MS = 10000;
const CONNECT_RETRY_MS = 50;

const sendMattMessageTCP = (
  message: string,
  host: string,
  port: number,
  deadline: number = Date.now() + CONNECT_TIMEOUT_MS,
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const socket = net.connect({ port, host });
    let settled = false;

    const settle = (action: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      action();
    };

    socket.on('connect', () => {
      socket.write(`${generateMattMessage(message)}\n`);
    });

    socket.on('data', (data) => {
      settle(() => resolve(parseMattMessage(data.toString())));
    });

    socket.on('close', () => {
      settle(() =>
        reject(
          new Error(
            `connection to ${host}:${port} closed before a MATT message arrived`,
          ),
        ),
      );
    });

    socket.on('error', (err: NodeJS.ErrnoException) => {
      // The mock server reports its port before the plugin is necessarily
      // accepting on it, so a refused connection is retried until the deadline
      // rather than failing the test.
      if (err.code === 'ECONNREFUSED' && Date.now() < deadline) {
        settle(() => {
          setTimeout(
            () =>
              sendMattMessageTCP(message, host, port, deadline).then(
                resolve,
                reject,
              ),
            CONNECT_RETRY_MS,
          );
        });
        return;
      }
      settle(() => reject(err));
    });
  });

const skipPluginTests = process.env['SKIP_PLUGIN_TESTS'] === 'true';
(skipPluginTests ? describe.skip : describe)('MATT protocol test', () => {
  let provider: ConsumerPact;
  let tcpProvider: ConsumerMessagePact;
  let port: number;
  const HOST = '127.0.0.1';

  describe('HTTP test', () => {
    beforeEach(() => {
      const mattRequest = `{"request": {"body": "hello"}}`;
      const mattResponse = `{"response":{"body":"world"}}`;

      provider = makeConsumerPact(
        'matt-consumer',
        'matt-provider',
        FfiSpecificationVersion.SPECIFICATION_VERSION_V4,
      );
      provider.addPlugin('matt', '0.1.1');

      const interaction = provider.newInteraction('');
      interaction.uponReceiving('A request to communicate via MATT');
      interaction.withRequest('POST', '/matt');
      interaction.withPluginRequestInteractionContents(
        'application/matt',
        mattRequest,
      );
      interaction.withStatus(200);
      interaction.withPluginResponseInteractionContents(
        'application/matt',
        mattResponse,
      );

      port = provider.createMockServer(HOST);
    });

    afterEach(() => {
      provider.cleanupPlugins();
      provider.cleanupMockServer(port);
    });

    it('returns a valid MATT message over HTTP', () =>
      axios
        .request({
          baseURL: `http://${HOST}:${port}`,
          headers: {
            'content-type': 'application/matt',
            Accept: 'application/matt',
          },
          data: generateMattMessage('hello'),
          method: 'POST',
          url: '/matt',
        })
        .then((res) => {
          expect(parseMattMessage(res.data)).toBe('world');
        })
        .then(() => {
          expect(provider.mockServerMatchedSuccessfully(port)).toBe(true);
        })
        .then(() => {
          // You don't have to call this, it's just here to check it works
          const mismatches = provider.mockServerMismatches(port);
          expect(mismatches).toHaveLength(0);
        })
        .then(() => {
          provider.writePactFile(path.join(__dirname, '__testoutput__'));
        }));
  });

  describe('TCP Messages', () => {
    beforeEach(() => {
      tcpProvider = makeConsumerMessagePact(
        'matt-tcp-consumer',
        'matt-tcp-provider',
        FfiSpecificationVersion.SPECIFICATION_VERSION_V4,
      );
    });

    describe('with MATT protocol', () => {
      afterEach(() => {
        tcpProvider.writePactFileForPluginServer(
          port,
          path.join(__dirname, '__testoutput__'),
        );
        tcpProvider.cleanupPlugins();
        // tcpProvider.cleanupMockServer(port)
      });

      beforeEach(() => {
        const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;
        tcpProvider.addPlugin('matt', '0.1.1');

        const message = tcpProvider.newSynchronousMessage('a MATT message');
        message.withPluginRequestResponseInteractionContents(
          'application/matt',
          mattMessage,
        );

        // TODO: this seems not to be written to the pact file
        port = tcpProvider.pactffiCreateMockServerForTransport(
          HOST,
          'matt',
          '',
        );
      });

      it('generates a pact with success', async () => {
        const message = await sendMattMessageTCP('hellotcp', HOST, port);
        expect(message).toBe('tcpworld');

        const res = tcpProvider.mockServerMatchedSuccessfully(port);
        expect(res).toBe(true);

        const mismatches = tcpProvider.mockServerMismatches(port);
        expect(mismatches.length).toBe(0);
      });
    });
  });
});
