import { Ffi, FfiPactHandle, FfiWritePactResponse } from '../ffi/types';
import { logErrorAndThrow, logCrashAndThrow } from '../logger';
import { MatchingResult, Mismatch } from './types';

export const mockServerMismatches = (
  ffi: Ffi,
  port: number
): MatchingResult[] => {
  const results: MatchingResult[] = JSON.parse(
    ffi.pactffiMockServerMismatches(port)
  );
  return results.map((result: MatchingResult) => ({
    ...result,
    ...('mismatches' in result
      ? {
          mismatches: result.mismatches.map((m: string | Mismatch) =>
            typeof m === 'string' ? JSON.parse(m) : m
          ),
        }
      : {}),
  }));
};

export const writePact = (
  ffi: Ffi,
  pactPtr: FfiPactHandle,
  dir: string,
  merge = true,
  port = 0
): void => {
  let result: FfiWritePactResponse;

  if (port) {
    result = ffi.pactffiWritePactFileByPort(port, dir, !merge);
  } else {
    result = ffi.pactffiWritePactFile(pactPtr, dir, !merge);
  }

  switch (result) {
    case FfiWritePactResponse['SUCCESS']:
      return;
    case FfiWritePactResponse['UNABLE_TO_WRITE_PACT_FILE']:
      logErrorAndThrow('The pact core was unable to write the pact file');
      break;
    case FfiWritePactResponse['GENERAL_PANIC']:
      logCrashAndThrow('The pact core panicked while writing the pact file');
      break;
    case FfiWritePactResponse['MOCK_SERVER_NOT_FOUND']:
      logCrashAndThrow(
        'The pact core was asked to write a pact file from a mock server that appears not to exist'
      );
      break;
    default:
      logCrashAndThrow(
        `The pact core returned an unknown error code (${result}) instead of writing the pact`
      );
  }
};
