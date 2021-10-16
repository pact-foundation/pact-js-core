import { ArgMapping, FunctionMapping, IgnoreOptionCombinations } from './types';
import logger from '../../logger';
import { InternalPactVerifierOptions } from '../types';

/**
 * This function maps arguments from the Verifier to the Rust core's verifier arguments
 *
 * @internal
 *
 * @param argMapping The argument mapping for the internal verifier
 * @param options The actual options passed by the user
 * @param ignoredArguments An array of strings for options to ignore (this is strings, because pact-js might put options on the object that we don't need)
 * @param ignoreOptionCombinations Describes some options that we might want to ignore if certain other options are not set
 * @returns An array of strings to past to the Rust core verifier
 */
export const argumentMapper = (
  argMapping: ArgMapping<InternalPactVerifierOptions>,
  options: InternalPactVerifierOptions,
  ignoredArguments: Array<string>,
  ignoreOptionCombinations: IgnoreOptionCombinations<InternalPactVerifierOptions>
): string[] =>
  (Object.keys(options) as Array<keyof InternalPactVerifierOptions>)
    .filter((k) => {
      const ignoreCondition = ignoreOptionCombinations[k];
      if (ignoreCondition !== undefined) {
        logger.trace(
          `The argument mapper has an ignored combination for '${k}'`
        );
        // We might have multiple ways to ignore option combinations in the future
        if (
          ignoreCondition.ifNotSet &&
          options[ignoreCondition.ifNotSet] === undefined
        ) {
          logger.warn(
            `Ignoring option '${k}' because it is invalid without '${ignoreCondition.ifNotSet}' also being set. This may indicate an error in your configuration`
          );
          return false;
        }
        logger.trace(`But it was not ignored: '${k}'`);
      }
      return true;
    })
    .map((key: keyof InternalPactVerifierOptions) => {
      // We pull these out, because TypeScript doesn't like to
      // reason that argMapping[key] is a constant value.
      // So, we need to pull it out to be able to say
      // `if('someKey' in thisMapping)` and retain type checking
      const thisMapping = argMapping[key];
      const thisValue = options[key];

      if (!thisMapping) {
        if (!ignoredArguments.includes(key)) {
          logger.error(`Pact-core is ignoring unknown option '${key}'`);
        }
        return [];
      }
      if (thisValue === undefined) {
        logger.warn(
          `The Verifier option '${key}' was was explicitly set to undefined and will be ignored. This may indicate an error in your config. Remove the option entirely to prevent this warning`
        );
        return [];
      }
      if ('warningMessage' in thisMapping) {
        logger.warn(thisMapping.warningMessage);
        return [];
      }
      if ('arg' in thisMapping) {
        switch (thisMapping.mapper) {
          case 'string':
            return [thisMapping.arg, `${thisValue}`];
          case 'flag':
            return thisValue ? [thisMapping.arg] : [];
          default:
            logger.pactCrash(
              `Option mapper for '${key}' maps to '${thisMapping.arg}' with unknown mapper type '${thisMapping.mapper}'`
            );
            return [];
        }
      }
      if (typeof thisMapping === 'function') {
        return (thisMapping as FunctionMapping<unknown>)(thisValue);
      }
      logger.pactCrash(
        `The option mapper completely failed to find a mapping for '${key}'.`
      );
      return [];
    })
    // This can be replaced with .flat() when node 10 is EOL
    .reduce((acc: string[], current: string[]) => [...acc, ...current], []);
