import { ArgMapping } from './types';
import logger from '../../logger';

export const argumentMapper = <PactOptions>(
  argMapping: ArgMapping<PactOptions>,
  options: PactOptions,
  ignoredArguments: string[]
): string[] =>
  Object.keys(options)
    .map((key: string) => {
      if (!argMapping[key]) {
        if (!ignoredArguments.includes(key)) {
          logger.error(`Pact-core is ignoring unknown option '${key}'`);
        }
        return [];
      }
      if (argMapping[key].warningMessage) {
        logger.warn(argMapping[key].warningMessage);
        return [];
      }
      if (argMapping[key].arg) {
        switch (argMapping[key].mapper) {
          case 'string':
            return [argMapping[key].arg, `${options[key]}`];
          case 'flag':
            return options[key] ? [argMapping[key].arg] : [];
          default:
            logger.pactCrash(
              `Option mapper for '${key}' maps to '${argMapping[key].arg}' with unknown mapper type '${argMapping[key].mapper}'`
            );
            return [];
        }
      }
      if (typeof argMapping[key] === 'function') {
        return argMapping[key](options[key]);
      }
      logger.pactCrash(
        `The option mapper completely failed to find a mapping for '${key}'.`
      );
      return [];
    })
    // This can be replaced with .flat() when node 10 is EOL
    .reduce((acc: string[], current: string[]) => [...acc, ...current], []);
