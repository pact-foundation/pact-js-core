const _ = require('underscore');
const checkTypes = require('check-types');

export interface SpawnArguments {
  [id: string]: string | string[] | boolean | number | undefined;
}

export const DEFAULT_ARG = 'DEFAULT';

export class Arguments {
  public fromSpawnArgs(
    args: SpawnArguments | SpawnArguments[],
    mappings: { [id: string]: string },
  ): string[] {
    return _.chain(args instanceof Array ? args : [args])
      .map((x: SpawnArguments) => this.createArgumentsFromObject(x, mappings))
      .flatten()
      .value();
  }

  public stringifySpawnArguments(obj: SpawnArguments): string {
    return _.chain(obj)
      .pairs()
      .map((v: string[]) => v.join(' = '))
      .value()
      .join(',\n');
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
