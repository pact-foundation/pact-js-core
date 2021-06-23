import * as fs from 'fs';
import * as path from 'path';
import install, { BinaryEntry, createConfig, getBinaryEntry } from './install';
import { FS } from './__mocks__/fs';

jest.mock('fs');
jest.mock('sumchecker', () =>
  jest.fn().mockImplementation(() => Promise.resolve())
);
jest.mock('libnpmconfig', () => ({
  read: (): jest.Mock => jest.fn(),
}));
jest.mock('tar');

describe('Install', () => {
  const packageBasePath: string = path.resolve(__dirname, '__fixtures__');
  const packagePath: string = path.resolve(packageBasePath, 'package.json');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let packageConfig = JSON.parse(JSON.stringify(require('../package.json')));
  let OLD_ENV: { [key: string]: string | undefined };

  function initFS(config: {
    pact_binary_location?: string;
    pact_do_not_track?: boolean;
  }): void {
    (fs as unknown as FS).initFS({
      [packagePath]: {
        ...packageConfig,
        config,
      },
    });
  }

  beforeEach(() => {
    jest.resetModules();
    OLD_ENV = { ...process.env };
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  describe('Package.json Configuration', () => {
    describe('Binary Location', () => {
      it('Should be able to set binary location as an absolute path', () => {
        const pact_binary_location = '/some-location/or-other';
        initFS({
          pact_binary_location,
        });
        const config = createConfig(packageBasePath);
        config.binaries.forEach((entry: BinaryEntry) => {
          expect(entry.downloadLocation).toEqual(
            path.resolve(pact_binary_location)
          );
        });
      });

      it('Should be able to set binary location as an relative path', () => {
        const pact_binary_location = 'some-location/or-other';
        initFS({ pact_binary_location });
        const config = createConfig(packageBasePath);
        config.binaries.forEach((entry: BinaryEntry) => {
          expect(entry.downloadLocation).toEqual(
            path.resolve(packageBasePath, pact_binary_location)
          );
        });
      });

      it('Should be able to set binary location as an HTTP URL', () => {
        const pact_binary_location = 'http://some.url';
        initFS({ pact_binary_location });
        const config = createConfig(packageBasePath);
        config.binaries.forEach((entry: BinaryEntry) => {
          expect(entry.downloadLocation).toEqual(pact_binary_location);
        });
      });

      it('Should be able to set binary location as an HTTPS URL', () => {
        const pact_binary_location = 'https://some.url';
        initFS({ pact_binary_location });
        const config = createConfig(packageBasePath);
        config.binaries.forEach((entry: BinaryEntry) => {
          expect(entry.downloadLocation).toEqual(pact_binary_location);
        });
      });
    });

    it("Should be able to set 'do not track' from package.json config", () => {
      const pact_do_not_track = true;
      initFS({ pact_do_not_track });
      const config = createConfig(packageBasePath);
      expect(config.doNotTrack).toEqual(pact_do_not_track);
    });
  });

  describe('Environment variables configuration', () => {
    it("Should be able to set 'do not track' from environment variable 'PACT_DO_NOT_TRACK'", () => {
      const doNotTrack = true;
      process.env.PACT_DO_NOT_TRACK = `${doNotTrack}`;
      const config = createConfig(packageBasePath);
      expect(config.doNotTrack).toEqual(doNotTrack);
    });
  });

  describe('Skip install binary', () => {
    it('Should not download it', async () => {
      process.env.PACT_SKIP_BINARY_INSTALL = 'true';
      const { binaryInstallSkipped } = await install('linux', 'ia32');
      expect(binaryInstallSkipped).toBeTruthy();
    });

    it('Should download it', async () => {
      const { binaryChecksum, binary } = getBinaryEntry('linux', 'ia32');
      (fs as unknown as FS).initFS({
        [path.join(__dirname, binary)]: 'mock binary',
        [path.join(__dirname, binaryChecksum)]: 'mock binary checksum',
      });

      process.env.PACT_SKIP_BINARY_INSTALL = 'false';
      const { binaryInstallSkipped } = await install('linux', 'ia32');
      expect(binaryInstallSkipped).toBeFalsy();
    });
  });
});
