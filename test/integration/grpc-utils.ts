import * as grpc from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';

/**
 * Resolve the `routeguide.RouteGuide` service out of a dynamically loaded
 * package definition, which the gRPC typings can only describe as an untyped
 * tree of namespaces, services and message types.
 */
export const loadRouteGuide = (
  definition: PackageDefinition,
): grpc.ServiceClientConstructor => {
  const routeguide = grpc.loadPackageDefinition(definition)[
    'routeguide'
  ] as grpc.GrpcObject;

  return routeguide['RouteGuide'] as grpc.ServiceClientConstructor;
};
