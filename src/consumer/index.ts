import { getFfiLib } from '../ffi';
import {
  CREATE_MOCK_SERVER_ERRORS,
  FfiSpecificationVersion,
  INTERACTION_PART_REQUEST,
  INTERACTION_PART_RESPONSE,
} from '../ffi/types';
import { logCrashAndThrow, logErrorAndThrow } from '../logger';
import { wrapAllWithCheck, wrapWithCheck } from './checkErrors';

import { ConsumerInteraction, ConsumerPact, MatchingResult } from './types';

type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap {
  [key: string]: AnyJson;
}
type JsonArray = Array<AnyJson>;

export const makeConsumerPact = (
  consumer: string,
  provider: string,
  version: FfiSpecificationVersion
): ConsumerPact => {
  const lib = getFfiLib();

  const pactPtr = lib.pactffi_new_pact(consumer, provider);
  lib.pactffi_with_specification(pactPtr, version);

  return {
    createMockServer: (address: string, tls = false) => {
      const port = lib.pactffi_create_mock_server_for_pact(
        pactPtr,
        address,
        tls
      );
      const error: keyof typeof CREATE_MOCK_SERVER_ERRORS | undefined =
        Object.keys(CREATE_MOCK_SERVER_ERRORS).find(
          (key) => CREATE_MOCK_SERVER_ERRORS[key] === port
        ) as keyof typeof CREATE_MOCK_SERVER_ERRORS;
      if (error) {
        if (error === 'ADDRESS_NOT_VALID') {
          logErrorAndThrow(
            `Unable to start mock server at '${address}'. Is the address valid?`
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
    mockServerMismatches: (port: number): MatchingResult => {
      const result = JSON.parse(lib.pactffi_mock_server_mismatches(port));
      return {
        ...result,
        ...(result.mismatches
          ? { mismatches: result.mismatches.map((m: string) => JSON.parse(m)) }
          : {}),
      };
    },
    cleanupMockServer: (port: number): boolean => {
      return wrapWithCheck<[number], (port: number) => boolean>(
        (port: number) => lib.pactffi_cleanup_mock_server(port),
        'cleanupMockServer'
      )(port);
    },
    newInteraction: (description: string): ConsumerInteraction => {
      const interactionPtr = lib.pactffi_new_interaction(pactPtr, description);
      return wrapAllWithCheck<ConsumerInteraction>({
        uponReceiving: (description: string) => {
          return lib.pactffi_upon_receiving(interactionPtr, description);
        },
        given: (state: string) => {
          return lib.pactffi_given(interactionPtr, state);
        },
        withRequest: (method: string, path: string) => {
          return lib.pactffi_with_request(interactionPtr, method, path);
        },
        withQuery: (name: string, index: number, value: string) => {
          return lib.pactffi_with_query_parameter(
            interactionPtr,
            name,
            index,
            value
          );
        },
        withRequestHeader: (name: string, index: number, value: string) => {
          return lib.pactffi_with_header(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            name,
            index,
            value
          );
        },
        withRequestBody: (body: string, contentType: string) => {
          return lib.pactffi_with_body(
            interactionPtr,
            INTERACTION_PART_REQUEST,
            contentType,
            body
          );
        },
        withResponseHeader: (name: string, index: number, value: string) => {
          return lib.pactffi_with_header(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            name,
            index,
            value
          );
        },
        withResponseBody: (body: string, contentType: string) => {
          return lib.pactffi_with_body(
            interactionPtr,
            INTERACTION_PART_RESPONSE,
            contentType,
            body
          );
        },
        withStatus: (status: number) => {
          return lib.pactffi_response_status(interactionPtr, status);
        },
      });
    },
  };
};
