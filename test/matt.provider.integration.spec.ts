import path = require('path');
import net = require('net');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import express = require('express');
import * as http from 'http';
import { setLogLevel } from '../src/logger';
import verifier from '../src/verifier';

chai.use(chaiAsPromised);

const parseMattMessage = (raw: string): string =>
  raw.replace(/(MATT)+/g, '').trim();
const generateMattMessage = (raw: string): string => `MATT${raw}MATT`;

const startHTTPServer = (host: string, port: number): Promise<http.Server> => {
  const server: express.Express = express();

  server.post('/matt', (req, res) => {
    res.setHeader('content-type', 'application/matt');
    res.send(generateMattMessage('world'));
  });

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, host, () => resolve());
  }).then(() => s);
};

const startTCPServer = (host: string, port: number) => {
  const server = net.createServer();

  server.on('connection', (sock) => {
    sock.on('data', (data) => {
      const msg = parseMattMessage(data.toString());

      if (msg === 'hellotcp') {
        sock.write(generateMattMessage('tcpworld'));
      } else {
        sock.write(generateMattMessage('message not understood'));
      }
      sock.write('\n');
    });
  });

  return new Promise((resolve) => {
    server.listen(port, host);

    server.on('listening', () => {
      resolve(null);
    });
  });
};

const skipPluginTests = process.env['SKIP_PLUGIN_TESTS'] === 'true';
(skipPluginTests ? describe.skip : describe)('MATT protocol test', () => {
  setLogLevel('info');

  describe('HTTP and TCP Provider', () => {
    const HOST = '127.0.0.1';
    const HTTP_PORT = 8888;
    const TCP_PORT = 8889;
    beforeEach(async () => {
      await startHTTPServer(HOST, HTTP_PORT);
      await startTCPServer(HOST, TCP_PORT);
    });

    it('returns a valid MATT message over HTTP and TCP', () =>
      verifier({
        providerBaseUrl: 'http://localhost:8888',
        transports: [
          {
            port: TCP_PORT,
            protocol: 'matt',
            scheme: 'tcp',
          },
        ],
        pactUrls: [
          path.join(
            __dirname,
            '__testoutput__',
            'matt-consumer-matt-provider.json'
          ),
          path.join(
            __dirname,
            '__testoutput__',
            'matt-tcp-consumer-matt-tcp-provider.json'
          ),
        ],
      }).verify());
  });
});
