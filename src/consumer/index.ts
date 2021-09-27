import { getFfiLib } from '../ffi';
import {
  FfiSpecificationVersion,
  INTERACTION_PART_REQUEST,
  INTERACTION_PART_RESPONSE,
} from '../ffi/types';

type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap {
  [key: string]: AnyJson;
}
type JsonArray = Array<AnyJson>;

type ConsumerInteraction = {
  uponReceiving: (description: string) => boolean;
  given: (state: string) => boolean;
  withRequest: (method: string, path: string) => boolean;
  withQuery: (name: string, index: number, value: string) => boolean;
  withStatus: (status: number) => boolean;
  withRequestHeader: (name: string, index: number, value: string) => boolean;
  withRequestBody: (body: string, contentType: string) => boolean;
  withResponseHeader: (name: string, index: number, value: string) => boolean;
  withResponseBody: (body: string, contentType: string) => boolean;
};

type ConsumerPact = {
  newInteraction: (description: string) => ConsumerInteraction;
};

export const makeConsumerPact = (
  consumer: string,
  provider: string,
  version: FfiSpecificationVersion
): ConsumerPact => {
  const lib = getFfiLib();

  const pactPtr = lib.pactffi_new_pact(consumer, provider);
  lib.pactffi_with_specification(pactPtr, version);

  return {
    newInteraction: (description: string): ConsumerInteraction => {
      const interactionPtr = lib.pactffi_new_interaction(pactPtr, description);
      return {
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
      };
    },
  };
};
