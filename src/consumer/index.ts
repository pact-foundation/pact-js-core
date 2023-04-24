import {
  CREATE_MOCK_SERVER_ERRORS,
  Ffi,
  FfiSpecificationVersion,
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
  SynchronousMessage,
} from './types';
import { getFfiLib } from '../ffi';
import { mockServerMismatches, writePact } from './internals';

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
  expectsToReceive: (description: string) =>
    ffi.pactffiMessageExpectsToReceive(interactionPtr, description),
  given: (state: string) => ffi.pactffiMessageGiven(interactionPtr, state),
  givenWithParam: (state: string, name: string, value: string) =>
    ffi.pactffiMessageGivenWithParam(interactionPtr, state, name, value),
  withContents: (body: string, contentType: string) =>
    ffi.pactffiMessageWithContents(interactionPtr, contentType, body),
  withBinaryContents: (body: Buffer, contentType: string) =>
    ffi.pactffiMessageWithBinaryContents(
      interactionPtr,
      contentType,
      body,
      body.length
    ),
  reifyMessage: () => ffi.pactffiMessageReify(interactionPtr),
  withMetadata: (name: string, value: string) =>
    ffi.pactffiMessageWithMetadata(interactionPtr, name, value),
});

export const makeConsumerPact = (
  consumer: string,
  provider: string,
  version: FfiSpecificationVersion = 3,
  logLevel = getLogLevel(),
  logFile?: string
): ConsumerPact => {
  const ffi = getFfiLib(logLevel, logFile);
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
    addPlugin: (name: string, pluginVersion: string) => {
      ffi.pactffiUsingPlugin(pactPtr, name, pluginVersion);
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
        `${address}:${requestedPort || 0}`,
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
          `The pact core couldn't create the mock server because of an error described by '${error}'`
        );
      }
      if (port <= 0) {
        logCrashAndThrow(
          `The pact core returned an unhandled error code '${port}'`
        );
      }
      return port;
    },
    mockServerMatchedSuccessfully: (port: number) =>
      ffi.pactffiMockServerMatched(port),
    mockServerMismatches: (port: number): MatchingResult[] =>
      mockServerMismatches(ffi, port),
    cleanupMockServer: (mockServerPort: number): boolean =>
      wrapWithCheck<(port: number) => boolean>(
        (port: number): boolean => ffi.pactffiCleanupMockServer(port),
        'cleanupMockServer'
      )(mockServerPort),
    writePactFile: (dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge),
    writePactFileForPluginServer: (port: number, dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge, port),
    addMetadata: (namespace: string, name: string, value: string): boolean =>
      ffi.pactffiWithPactMetadata(pactPtr, namespace, name, value),
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
        given: (state: string) => ffi.pactffiGiven(interactionPtr, state),
        givenWithParam: (state: string, name: string, value: string) =>
          ffi.pactffiGivenWithParam(interactionPtr, state, name, value),
        withRequestContents: (body: string, contentType: string) =>
          ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          ),
        withResponseContents: (body: string, contentType: string) =>
          ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          ),
        withRequestBinaryContents: (body: Buffer, contentType: string) =>
          ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body,
            body.length
          ),
        withResponseBinaryContents: (body: Buffer, contentType: string) =>
          ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body,
            body.length
          ),
        withMetadata: (name: string, value: string) =>
          ffi.pactffiMessageWithMetadata(interactionPtr, name, value),
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
    newInteraction: (interactionDescription: string): ConsumerInteraction => {
      const interactionPtr = ffi.pactffiNewInteraction(
        pactPtr,
        interactionDescription
      );

      return wrapAllWithCheck<ConsumerInteraction>({
        uponReceiving: (recieveDescription: string) =>
          ffi.pactffiUponReceiving(interactionPtr, recieveDescription),
        given: (state: string) => ffi.pactffiGiven(interactionPtr, state),
        givenWithParam: (state: string, name: string, value: string) =>
          ffi.pactffiGivenWithParam(interactionPtr, state, name, value),
        withRequest: (method: string, path: string) =>
          ffi.pactffiWithRequest(interactionPtr, method, path),
        withQuery: (name: string, index: number, value: string) =>
          ffi.pactffiWithQueryParameter(interactionPtr, name, index, value),
        withRequestHeader: (name: string, index: number, value: string) =>
          ffi.pactffiWithHeader(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            name,
            index,
            value
          ),
        withRequestBody: (body: string, contentType: string) =>
          ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          ),
        withRequestBinaryBody: (body: Buffer, contentType: string) =>
          ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body,
            body.length
          ),
        withRequestMultipartBody: (
          contentType: string,
          filename: string,
          mimePartName: string
        ) =>
          ffi.pactffiWithMultipartFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            filename,
            mimePartName
          ) === undefined,
        withResponseHeader: (name: string, index: number, value: string) =>
          ffi.pactffiWithHeader(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            name,
            index,
            value
          ),
        withResponseBody: (body: string, contentType: string) =>
          ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          ),
        withResponseBinaryBody: (body: Buffer, contentType: string) =>
          ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body,
            body.length
          ),
        withResponseMultipartBody: (
          contentType: string,
          filename: string,
          mimePartName: string
        ) =>
          ffi.pactffiWithMultipartFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            filename,
            mimePartName
          ) === undefined,
        withStatus: (status: number) =>
          ffi.pactffiResponseStatus(interactionPtr, status),
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
  logLevel = getLogLevel(),
  logFile?: string
): ConsumerMessagePact => {
  const ffi = getFfiLib(logLevel, logFile);
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
    addPlugin: (name: string, pluginVersion: string) => {
      ffi.pactffiUsingPlugin(pactPtr, name, pluginVersion);
    },
    cleanupPlugins: () => {
      ffi.pactffiCleanupPlugins(pactPtr);
    },
    cleanupMockServer: (mockServerPort: number): boolean =>
      wrapWithCheck<(port: number) => boolean>(
        (port: number): boolean => ffi.pactffiCleanupMockServer(port),
        'cleanupMockServer'
      )(mockServerPort),
    writePactFile: (dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge),
    writePactFileForPluginServer: (port: number, dir: string, merge = true) =>
      writePact(ffi, pactPtr, dir, merge, port),
    addMetadata: (namespace: string, name: string, value: string): boolean =>
      ffi.pactffiWithPactMetadata(pactPtr, namespace, name, value),
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
        given: (state: string) => ffi.pactffiGiven(interactionPtr, state),
        givenWithParam: (state: string, name: string, value: string) =>
          ffi.pactffiGivenWithParam(interactionPtr, state, name, value),
        withRequestContents: (body: string, contentType: string) =>
          ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          ),
        withResponseContents: (body: string, contentType: string) =>
          ffi.pactffiWithBody(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          ),
        withRequestBinaryContents: (body: Buffer, contentType: string) =>
          ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body,
            body.length
          ),
        withResponseBinaryContents: (body: Buffer, contentType: string) =>
          ffi.pactffiWithBinaryFile(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body,
            body.length
          ),
        withMetadata: (name: string, value: string) =>
          ffi.pactffiMessageWithMetadata(interactionPtr, name, value),
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
    mockServerMatchedSuccessfully: (port: number) =>
      ffi.pactffiMockServerMatched(port),
    mockServerMismatches: (port: number): MatchingResult[] =>
      mockServerMismatches(ffi, port),
  };
};

export const makeConsumerAsyncMessagePact = makeConsumerMessagePact;
