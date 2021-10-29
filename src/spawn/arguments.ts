// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('underscore');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkTypes = require('check-types');

import { CanDeployOptions } from '../can-deploy';
import { MessageOptions } from '../message';
import { PublisherOptions } from '../publisher';
import { ServiceOptions } from '../service';
import { VerifierOptions } from '../verifier';

export type CliVerbOptions = {
  cliVerb: string;
};

export type SpawnArgument =
  | CanDeployOptions
  | MessageOptions
  | PublisherOptions
  | ServiceOptions
  | VerifierOptions
  | CliVerbOptions
  | unknown; // unknown is allowed to make tests less noisy. We should change this in the future

export type SpawnArguments = Array<SpawnArgument> | SpawnArgument;

export const DEFAULT_ARG = 'DEFAULT';
export const PACT_NODE_NO_VALUE = 'PACT_NODE_NO_VALUE';

const valFor = (v: SpawnArgument): Array<string> => {
  if (typeof v === 'object') {
    return [JSON.stringify(v)];
  }
  return v !== PACT_NODE_NO_VALUE ? [`${v}`] : [];
};

const mapFor = (mapping: string, v: string): Array<string> =>
  mapping === DEFAULT_ARG ? valFor(v) : [mapping].concat(valFor(v));

const convertValue = (
  mapping: string,
  v: SpawnArgument | Array<SpawnArgument>
): Array<string> => {
  if (v && mapping) {
    return checkTypes.array(v)
      ? _.flatten(
          (v as Array<string>).map((val: string) => mapFor(mapping, val))
        )
      : mapFor(mapping, v as string);
  }
  return [];
};

export class Arguments {
  public toArgumentsArray(
    args: SpawnArguments,
    mappings: { [id: string]: string }
  ): string[] {
    return _.chain(args instanceof Array ? args : [args])
      .map((x: SpawnArguments) => this.createArgumentsFromObject(x, mappings))
      .flatten()
      .value();
  }

  private createArgumentsFromObject(
    args: SpawnArguments,
    mappings: { [id: string]: string }
  ): string[] {
    return _.chain(args)
      .reduce(
        (
          acc: Array<string>,
          value: SpawnArguments | Array<SpawnArguments>,
          key: string
        ): Array<string> =>
          mappings[key] === DEFAULT_ARG
            ? convertValue(mappings[key], value).concat(acc)
            : acc.concat(convertValue(mappings[key], value)),
        []
      )
      .flatten()
      .compact()
      .value();
  }
}

export default new Arguments();
