export type FfiSpecificationVersion = 0 | 1 | 2 | 3 | 4 | 5;

export const FfiSpecificationVersion = {
  SPECIFICATION_VERSION_UNKNOWN: 0,
  SPECIFICATION_VERSION_V1: 1,
  SPECIFICATION_VERSION_V1_1: 2,
  SPECIFICATION_VERSION_V2: 3,
  SPECIFICATION_VERSION_V3: 4,
  SPECIFICATION_VERSION_V4: 5,
};

export type FfiInteractionPart = 0 | 1;

export const INTERACTION_PART_REQUEST: FfiInteractionPart = 0;
export const INTERACTION_PART_RESPONSE: FfiInteractionPart = 1;
