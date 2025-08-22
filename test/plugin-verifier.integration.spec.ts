import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadSync } from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import express from 'express';
import * as http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { returnJson } from './integration/data-utils';
import verifierFactory from '../src/verifier';

const { expect } = chai;
chai.use(chaiAsPromised);

const HTTP_PORT = 50051;
const GRPC_PORT = 50052;

const getGRPCServer = () => {
  const PROTO_PATH = `${__dirname}/integration/grpc/route_guide.proto`;

  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };
  const packageDefinition = loadSync(PROTO_PATH, options);
  const { routeguide } = grpc.loadPackageDefinition(packageDefinition);

  const server = new grpc.Server();

  server.addService(routeguide['RouteGuide'].service, {
    getFeature: (_: unknown, callback: any) => {
      callback(null, {
        name: 'A place',
        latitude: 200,
        longitude: 180,
      });
    },
  });

  return server;
};

const startGRPCServer = (server: any, port: number) => {
  server.bindAsync(
    `127.0.0.1:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (_: unknown, grpcPort: number) => {
      console.log(`Server running at http://127.0.0.1:${grpcPort}`);
      server.start();
    }
  );
};

const startHTTPServer = (port: number): Promise<http.Server> => {
  const server: express.Express = express();
  server.use(cors());
  server.use(bodyParser.json());
  server.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  // Dummy server to respond to state changes etc.
  server.all('/*', returnJson({}));

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, () => resolve());
  }).then(() => s);
};

const getFeature = async (address: string, protoFile: string) => {
  const def = loadSync(protoFile);
  const { routeguide } = grpc.loadPackageDefinition(def);

  const client = new routeguide['RouteGuide'](
    address,
    grpc.credentials.createInsecure()
  );

  return new Promise<any>((resolve, reject) => {
    client.GetFeature(
      {
        latitude: 180,
        longitude: 200,
      },
      (e: Error, feature: any) => {
        if (e) {
          reject(e);
        } else {
          resolve(feature);
        }
      }
    );
  });
};

const skipPluginTests = process.env['SKIP_PLUGIN_TESTS'] === 'true';
(skipPluginTests ? describe.skip : describe)(
  'Plugin Verifier Integration Spec',
  () => {
    context('plugin tests', () => {
      describe('grpc interaction', () => {
        before(async () => {
          const server = getGRPCServer();
          startGRPCServer(server, GRPC_PORT);
          await startHTTPServer(HTTP_PORT);
        });

        it('should verify the gRPC interactions', async () => {
          await verifierFactory({
            providerBaseUrl: `http://127.0.0.1:${HTTP_PORT}`,
            transports: [
              {
                port: GRPC_PORT,
                protocol: 'grpc',
              },
            ],
            logLevel: 'debug',
            pactUrls: [`${__dirname}/integration/grpc/grpc.json`],
          }).verify();

          expect('').to.eq('');
        });

        it('runs the grpc client', async () => {
          const protoFile = `${__dirname}/integration/grpc/route_guide.proto`;
          const feature = await getFeature(`127.0.0.1:${GRPC_PORT}`, protoFile);

          console.log(feature);
        });
      });
    });
  }
);
