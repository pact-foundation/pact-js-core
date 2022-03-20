import {
  CREATE_MOCK_SERVER_ERRORS,
  Ffi,
  FfiPactHandle,
  FfiSpecificationVersion,
  FfiWritePactResponse,
  INTERACTION_PART_REQUEST,
  INTERACTION_PART_RESPONSE,
} from '../ffi/types';
import {
  getLogLevel,
  setLogLevel,
  logCrashAndThrow,
  logErrorAndThrow,
} from '../logger';
import { wrapAllWithCheck, wrapWithCheck } from './checkErrors';

import {
  ConsumerInteraction,
  ConsumerMessage,
  ConsumerMessagePact,
  ConsumerPact,
  MatchingResult,
  Mismatch,
} from './types';
import { getFfiLib } from '../ffi';

export const makeConsumerPact = (
  consumer: string,
  provider: string,
  version: FfiSpecificationVersion = 3,
  logLevel = getLogLevel()
): ConsumerPact => {
  const ffi = getFfiLib(logLevel);
  if (logLevel) {
    setLogLevel(logLevel);
  }

  const pactPtr = ffi.pactffiNewPact(consumer, provider);
  if (!ffi.pactffiWithSpecification(pactPtr, version)) {
    throw new Error(
      `Unable to set core spec version. The pact FfiSpecificationVersion '${version}' may be invalid (note this is not the same as the pact spec version)`
    );
  }

  return {
    createMockServer: (
      address: string,
      requestedPort?: number,
      tls = false
    ) => {
      const port = ffi.pactffiCreateMockServerForPact(
        pactPtr,
        `${address}:${requestedPort ? requestedPort : 0}`,
        tls
      );
      const error: keyof typeof CREATE_MOCK_SERVER_ERRORS | undefined =
        Object.keys(CREATE_MOCK_SERVER_ERRORS).find(
          (key) => CREATE_MOCK_SERVER_ERRORS[key] === port
        ) as keyof typeof CREATE_MOCK_SERVER_ERRORS;
      if (error) {
        if (error === 'ADDRESS_NOT_VALID') {
          logErrorAndThrow(
            `Unable to start mock server at '${address}'. Is the address and port valid?`
          );
        }
        if (error === 'TLS_CONFIG') {
          logErrorAndThrow(
            `Unable to create TLS configuration with self-signed certificate`
          );
        }
        logCrashAndThrow(
          `The pact core couldn\'t create the mock server because of an error described by '${error}'`
        );
      }
      if (port <= 0) {
        logCrashAndThrow(
          `The pact core returned an unhandled error code '${port}'`
        );
      }
      return port;
    },

    mockServerMatchedSuccessfully: (port: number) => {
      return ffi.pactffiMockServerMatched(port);
    },
    mockServerMismatches: (port: number): MatchingResult[] => {
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
    },
    cleanupMockServer: (port: number): boolean => {
      return wrapWithCheck<(port: number) => boolean>(
        (port: number): boolean => ffi.pactffiCleanupMockServer(port),
        'cleanupMockServer'
      )(port);
    },
    writePactFile: (dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge),
    addMetadata: (namespace: string, name: string, value: string): boolean => {
      return ffi.pactffiWithPactMetadata(pactPtr, namespace, name, value);
    },
    newInteraction: (description: string): ConsumerInteraction => {
      const interactionPtr = ffi.pactffiNewInteraction(pactPtr, description);

      return wrapAllWithCheck<ConsumerInteraction>({
        uponReceiving: (description: string) => {
          return ffi.pactffiUponReceiving(interactionPtr, description);
        },
        given: (state: string) => {
          return ffi.pactffiGiven(interactionPtr, state);
        },
        givenWithParam: (state: string, name: string, value: string) => {
          return ffi.pactffiGivenWithParam(interactionPtr, state, name, value);
        },
        withRequest: (method: string, path: string) => {
          return ffi.pactffiWithRequest(interactionPtr, method, path);
        },
        withQuery: (name: string, index: number, value: string) => {
          return ffi.pactffiWithQueryParameter(
            interactionPtr,
            name,
            index,
            value
          );
        },
        withRequestHeader: (name: string, index: number, value: string) => {
          return ffi.pactffiWithHeader(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            name,
            index,
            value
          );
        },
        withRequestBody: (body: string, contentType: string) => {
          return ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          );
        },
        withRequestBinaryBody: (body: Buffer, contentType: string) => {
          return ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body,
            body.length
          );
        },
        withRequestMultipartBody: (
          contentType: string,
          filename: string,
          mimePartName: string
        ) => {
          return (
            ffi.pactffiWithMultipartFile(
              interactionPtr,
              INTERACTION_PART_REQUEST,
              contentType,
              filename,
              mimePartName
            ) === undefined
          );
        },
        withResponseHeader: (name: string, index: number, value: string) => {
          return ffi.pactffiWithHeader(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            name,
            index,
            value
          );
        },
        withResponseBody: (body: string, contentType: string) => {
          return ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          );
        },
        withResponseBinaryBody: (body: Buffer, contentType: string) => {
          return ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body,
            body.length
          );
        },
        withResponseMultipartBody: (
          contentType: string,
          filename: string,
          mimePartName: string
        ) => {
          return (
            ffi.pactffiWithMultipartFile(
              interactionPtr,
              INTERACTION_PART_RESPONSE,
              contentType,
              filename,
              mimePartName
            ) === undefined
          );
        },
        withStatus: (status: number) => {
          return ffi.pactffiResponseStatus(interactionPtr, status);
        },
      });
    },
  };
};

export const makeConsumerAsyncMessagePact = (
  consumer: string,
  provider: string,
  version: FfiSpecificationVersion = 4,
  logLevel = getLogLevel()
): ConsumerMessagePact => {
  const ffi = getFfiLib(logLevel);
  if (logLevel) {
    setLogLevel(logLevel);
  }

  const pactPtr = ffi.pactffiNewPact(consumer, provider);
  if (!ffi.pactffiWithSpecification(pactPtr, version) || version < 4) {
    throw new Error(
      `Unable to set core spec version. The pact FfiSpecificationVersion '${version}' may be invalid (note this is not the same as the pact spec version). It should be set to at least 3`
    );
  }

  return {
    writePactFile: (dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge),
    addMetadata: (namespace: string, name: string, value: string): boolean => {
      return ffi.pactffiWithPactMetadata(pactPtr, namespace, name, value);
    },
    newMessage: (description: string): ConsumerMessage => {
      const interactionPtr = ffi.pactffiNewAsyncMessage(pactPtr, description);

      return {
        expectsToReceive: (description: string) => {
          return ffi.pactffiMessageExpectsToReceive(
            interactionPtr,
            description
          );
        },
        given: (state: string) => {
          return ffi.pactffiMessageGiven(interactionPtr, state);
        },
        givenWithParam: (state: string, name: string, value: string) => {
          return ffi.pactffiMessageGivenWithParam(
            interactionPtr,
            state,
            name,
            value
          );
        },
        withContents: (body: Buffer, contentType: string) => {
          return ffi.pactffiMessageWithContents(
            interactionPtr,
            contentType,
            body,
            body.length
          );
        },
        reifyMessage: () => {
          return ffi.pactffiMessageReify(interactionPtr);
        },
        withMetadata: (name: string, value: string) => {
          return ffi.pactffiMessageWithMetadata(interactionPtr, name, value);
        },
      };
    },
  };
};

const writePact = (
  ffi: Ffi,
  pactPtr: FfiPactHandle,
  dir: string,
  merge = true
) => {
  const result = ffi.pactffiWritePactFile(pactPtr, dir, !merge);
  switch (result) {
    case FfiWritePactResponse.SUCCESS:
      return;
    case FfiWritePactResponse.UNABLE_TO_WRITE_PACT_FILE:
      logErrorAndThrow('The pact core was unable to write the pact file');
    case FfiWritePactResponse.GENERAL_PANIC:
      logCrashAndThrow('The pact core panicked while writing the pact file');
    case FfiWritePactResponse.MOCK_SERVER_NOT_FOUND:
      logCrashAndThrow(
        'The pact core was asked to write a pact file from a mock server that appears not to exist'
      );
    default:
      logCrashAndThrow(
        `The pact core returned an unknown error code (${result}) instead of writing the pact`
      );
  }
};

export * from './types';
