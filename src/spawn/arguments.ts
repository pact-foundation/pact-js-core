const _ = require('underscore');
const checkTypes = require('check-types');

import { CanDeployOptions } from '../can-deploy';
import { MessageOptions } from '../message';
import { PublisherOptions } from '../publisher';
import { ServiceOptions } from '../service';
import { VerifierOptions } from '../verifier';

export type SpawnArguments =
  | CanDeployOptions[]
  | MessageOptions
  | PublisherOptions
  | ServiceOptions
  | VerifierOptions
  | {}; // Empty object is allowed to make tests less noisy. We should change this in the future

export const DEFAULT_ARG = 'DEFAULT';

export class Arguments {
  public fromSpawnArgs(
    args: SpawnArguments,
    mappings: { [id: string]: string },
  ): string[] {
    return _.chain(args instanceof Array ? args : [args])
      .map((x: SpawnArguments) => this.createArgumentsFromObject(x, mappings))
      .flatten()
      .value();
  }

  private createArgumentsFromObject(
    args: SpawnArguments,
    mappings: { [id: string]: string },
  ): string[] {
    return _.chain(args)
      .reduce((acc: any, value: any, key: any) => {
        if (value && mappings[key]) {
          let mapping = mappings[key];
          let f = acc.push.bind(acc);
          if (mapping === DEFAULT_ARG) {
            mapping = '';
            f = acc.unshift.bind(acc);
          }
          _.map(checkTypes.array(value) ? value : [value], (v: any) =>
            f([mapping, `'${v}'`]),
          );
        }
        return acc;
      }, [])
      .flatten()
      .compact()
      .value();
  }
}

export default new Arguments();
