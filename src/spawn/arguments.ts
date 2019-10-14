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
export const PACT_NODE_NO_VALUE = 'PACT_NODE_NO_VALUE';

const valFor = (v: any) => (v !== PACT_NODE_NO_VALUE ? [`'${v}'`] : []);

const mapFor = (mapping: string, v: any) =>
  mapping === DEFAULT_ARG ? valFor(v) : [mapping].concat(valFor(v));

const convertValue = (mapping: string, v: any) => {
  if (v && mapping) {
    return checkTypes.array(v)
      ? _.flatten(v.map((val: any) => mapFor(mapping, val)))
      : mapFor(mapping, v);
  }
  return [];
};

export class Arguments {
  public toArgumentsArray(
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
      .reduce(
        (acc: any, value: any, key: any) =>
          mappings[key] === DEFAULT_ARG
            ? convertValue(mappings[key], value).concat(acc)
            : acc.concat(convertValue(mappings[key], value)),
        [],
      )
      .flatten()
      .compact()
      .value();
  }
}

export default new Arguments();
