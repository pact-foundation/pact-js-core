import path = require('path');
import net = require('net');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { setLogLevel } from '../src/logger';
import verifier from '../src/verifier';
import express = require('express');
import * as http from 'http';

chai.use(chaiAsPromised);

describe.skip('MATT protocol test', () => {
  setLogLevel('info');

  describe('HTTP and TCP Provider', () => {
    const HOST = '127.0.0.1';
    const HTTP_PORT = 8888;
    const TCP_PORT = 8889;
    beforeEach(async () => {
      await startHTTPServer(HOST, HTTP_PORT);
      await startTCPServer(HOST, TCP_PORT);
    });

    it('returns a valid MATT message over HTTP and TCP', () => {
      return verifier({
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
      }).verify();
    });
  });
});

const startHTTPServer = (host: string, port: number): Promise<http.Server> => {
  const server: express.Express = express();

  server.post('/matt', (req, res) => {
    console.log('received a /matt message', req.body);
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
    console.log(`Connected to client ${sock.remoteAddress}:${sock.remotePort}`);

    sock.on('data', (data) => {
      const msg = parseMattMessage(data.toString());
      console.log(`Received data from ${sock.remoteAddress}: ${msg}`);

      sock.write(generateMattMessage('tcpworld'));
      sock.write('\n');
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, host);

    server.on('listening', () => {
      console.log('listening!');
      resolve(null);
    });
  });
};

const parseMattMessage = (raw: string): string => {
  return raw.replace(/(MATT)+/g, '').trim();
};
const generateMattMessage = (raw: string): string => {
  return `MATT${raw}MATT`;
};
