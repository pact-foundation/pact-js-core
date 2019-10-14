// tslint:disable:no-string-literal
import * as path from 'path';

export class PactEnvironment {
  public get cwd(): string {
    return path.resolve(__dirname, '..');
  }

  public isWindows(platform: string = process.platform): boolean {
    return platform === 'win32';
  }
}

export default new PactEnvironment();
