import type * as http from 'node:http';
import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import verifierFactory from '../src/verifier';

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

  server.addService(routeguide.RouteGuide.service, {
    // biome-ignore lint/suspicious/noExplicitAny: gRPC service handlers loaded via dynamic proto definition have no static type for their callback
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

const startGRPCServer = (server: grpc.Server, port: number) => {
  server.bindAsync(
    `127.0.0.1:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (_: unknown, grpcPort: number) => {
      console.log(`Server running at http://127.0.0.1:${grpcPort}`);
      server.start();
    },
  );
};

const startHTTPServer = (port: number): Promise<http.Server> => {
  const server: express.Express = express();
  server.use(cors());
  server.use(bodyParser.json());
  server.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  // Dummy server to respond to state changes etc.
  server.all('/*splat', (_req: express.Request, res: express.Response) => {
    res.json({});
  });

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, () => resolve());
  }).then(() => s);
};

const getFeature = async (address: string, protoFile: string) => {
  const def = loadSync(protoFile);
  const { routeguide } = grpc.loadPackageDefinition(def);

  const client = new routeguide.RouteGuide(
    address,
    grpc.credentials.createInsecure(),
  );

  return new Promise<unknown>((resolve, reject) => {
    client.GetFeature(
      {
        latitude: 180,
        longitude: 200,
      },
      (e: Error, feature: unknown) => {
        if (e) {
          reject(e);
        } else {
          resolve(feature);
        }
      },
    );
  });
};

const skipPluginTests = process.env.SKIP_PLUGIN_TESTS === 'true';
(skipPluginTests ? describe.skip : describe)(
  'Plugin Verifier Integration Spec',
  () => {
    describe('plugin tests', () => {
      describe('grpc interaction', () => {
        beforeAll(async () => {
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

          expect('').toBe('');
        });

        it('runs the grpc client', async () => {
          const protoFile = `${__dirname}/integration/grpc/route_guide.proto`;
          const feature = await getFeature(`127.0.0.1:${GRPC_PORT}`, protoFile);

          console.log(feature);
        });
      });
    });
  },
);
