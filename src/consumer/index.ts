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
  AsynchronousMessage,
  ConsumerInteraction,
  ConsumerMessagePact,
  ConsumerPact,
  MatchingResult,
  Mismatch,
  SynchronousMessage,
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
    addPlugin: (name: string, version: string) => {
      ffi.pactffiUsingPlugin(pactPtr, name, version);
    },
    cleanupPlugins: () => {
      ffi.pactffiCleanupPlugins(pactPtr);
    },
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
      return mockServerMismatches(ffi, port);
    },
    cleanupMockServer: (port: number): boolean => {
      return wrapWithCheck<(port: number) => boolean>(
        (port: number): boolean => ffi.pactffiCleanupMockServer(port),
        'cleanupMockServer'
      )(port);
    },
    writePactFile: (dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge),
    writePactFileForPluginServer: (port: number, dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge, port),
    addMetadata: (namespace: string, name: string, value: string): boolean => {
      return ffi.pactffiWithPactMetadata(pactPtr, namespace, name, value);
    },
    newAsynchronousMessage: (description: string): AsynchronousMessage => {
      const interactionPtr = ffi.pactffiNewAsyncMessage(pactPtr, description);

      return asyncMessage(ffi, interactionPtr);
    },
    newSynchronousMessage: (description: string): SynchronousMessage => {
      // TODO: will this automatically set the correct spec version?
      const interactionPtr = ffi.pactffiNewSyncMessage(pactPtr, description);

      return {
        withPluginRequestInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            contents
          );
          return true;
        },
        withPluginResponseInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            contents
          );
          return true;
        },
        withPluginRequestResponseInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            contents
          );
          return true;
        },
        given: (state: string) => {
          return ffi.pactffiGiven(interactionPtr, state);
        },
        givenWithParam: (state: string, name: string, value: string) => {
          return ffi.pactffiGivenWithParam(interactionPtr, state, name, value);
        },
        withRequestContents: (body: string, contentType: string) => {
          return ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          );
        },
        withResponseContents: (body: string, contentType: string) => {
          return ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          );
        },
        withRequestBinaryContents: (body: Buffer, contentType: string) => {
          return ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body,
            body.length
          );
        },
        withResponseBinaryContents: (body: Buffer, contentType: string) => {
          return ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body,
            body.length
          );
        },
        withMetadata: (name: string, value: string) => {
          return ffi.pactffiMessageWithMetadata(interactionPtr, name, value);
        },
      };
    },
    pactffiCreateMockServerForTransport(
      address: string,
      transport: string,
      config: string,
      port?: number
    ) {
      return ffi.pactffiCreateMockServerForTransport(
        pactPtr,
        address,
        port || 0,
        transport,
        config
      );
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
        withPluginRequestInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            contents
          );

          return true;
        },
        withPluginRequestResponseInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            contents
          );

          return true;
        },
        withPluginResponseInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            contents
          );
          return true;
        },
      });
    },
  };
};

export const makeConsumerMessagePact = (
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
    addPlugin: (name: string, version: string) => {
      ffi.pactffiUsingPlugin(pactPtr, name, version);
    },
    cleanupPlugins: () => {
      ffi.pactffiCleanupPlugins(pactPtr);
    },
    cleanupMockServer: (port: number): boolean => {
      return wrapWithCheck<(port: number) => boolean>(
        (port: number): boolean => ffi.pactffiCleanupMockServer(port),
        'cleanupMockServer'
      )(port);
    },
    writePactFile: (dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge),
    writePactFileForPluginServer: (port: number, dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge, port),
    addMetadata: (namespace: string, name: string, value: string): boolean => {
      return ffi.pactffiWithPactMetadata(pactPtr, namespace, name, value);
    },
    // Alias for newAsynchronousMessage
    newMessage: (description: string): AsynchronousMessage => {
      const interactionPtr = ffi.pactffiNewAsyncMessage(pactPtr, description);

      return asyncMessage(ffi, interactionPtr);
    },
    newAsynchronousMessage: (description: string): AsynchronousMessage => {
      const interactionPtr = ffi.pactffiNewAsyncMessage(pactPtr, description);

      return asyncMessage(ffi, interactionPtr);
    },
    newSynchronousMessage: (description: string): SynchronousMessage => {
      // TODO: will this automatically set the correct spec version?
      const interactionPtr = ffi.pactffiNewSyncMessage(pactPtr, description);

      return {
        withPluginRequestInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            contents
          );
          return true;
        },
        withPluginResponseInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            contents
          );
          return true;
        },
        withPluginRequestResponseInteractionContents: (
          contentType: string,
          contents: string
        ) => {
          ffi.pactffiPluginInteractionContents(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            contents
          );
          return true;
        },
        given: (state: string) => {
          return ffi.pactffiGiven(interactionPtr, state);
        },
        givenWithParam: (state: string, name: string, value: string) => {
          return ffi.pactffiGivenWithParam(interactionPtr, state, name, value);
        },
        withRequestContents: (body: string, contentType: string) => {
          return ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          );
        },
        withResponseContents: (body: string, contentType: string) => {
          return ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          );
        },
        withRequestBinaryContents: (body: Buffer, contentType: string) => {
          return ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body,
            body.length
          );
        },
        withResponseBinaryContents: (body: Buffer, contentType: string) => {
          return ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body,
            body.length
          );
        },
        withMetadata: (name: string, value: string) => {
          return ffi.pactffiMessageWithMetadata(interactionPtr, name, value);
        },
      };
    },
    pactffiCreateMockServerForTransport(
      address: string,
      transport: string,
      config: string,
      port?: number
    ) {
      return ffi.pactffiCreateMockServerForTransport(
        pactPtr,
        address,
        port || 0,
        transport,
        config
      );
    },
    mockServerMatchedSuccessfully: (port: number) => {
      return ffi.pactffiMockServerMatched(port);
    },
    mockServerMismatches: (port: number): MatchingResult[] => {
      return mockServerMismatches(ffi, port);
    },
  };
};

export const makeConsumerAsyncMessagePact = makeConsumerMessagePact;

const mockServerMismatches = (ffi: Ffi, port: number) => {
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
const writePact = (
  ffi: Ffi,
  pactPtr: FfiPactHandle,
  dir: string,
  merge = true,
  port = 0
) => {
  let result: FfiWritePactResponse;

  if (port != 0) {
    result = ffi.pactffiWritePactFileByPort(port, dir, !merge);
  } else {
    result = ffi.pactffiWritePactFile(pactPtr, dir, !merge);
  }

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

const asyncMessage = (ffi: Ffi, interactionPtr: number) => ({
  withPluginRequestInteractionContents: (
    contentType: string,
    contents: string
  ) => {
    ffi.pactffiPluginInteractionContents(
      interactionPtr,
      INTERACTION_PART_REQUEST,
      contentType,
      contents
    );
    return true;
  },
  expectsToReceive: (description: string) => {
    return ffi.pactffiMessageExpectsToReceive(interactionPtr, description);
  },
  given: (state: string) => {
    return ffi.pactffiMessageGiven(interactionPtr, state);
  },
  givenWithParam: (state: string, name: string, value: string) => {
    return ffi.pactffiMessageGivenWithParam(interactionPtr, state, name, value);
  },
  withContents: (body: string, contentType: string) => {
    return ffi.pactffiMessageWithContents(interactionPtr, contentType, body);
  },
  withBinaryContents: (body: Buffer, contentType: string) => {
    return ffi.pactffiMessageWithBinaryContents(
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
});

export * from './types';
