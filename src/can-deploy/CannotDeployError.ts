import { CanDeployResponse } from './types';

export class CannotDeployError extends Error {
  output: CanDeployResponse | string;

  constructor(output: CanDeployResponse | string) {
    super('can-i-deploy result: it is not safe to deploy');
    this.name = 'CannotDeployError';
    this.output = output;
  }
}
