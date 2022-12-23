#include <napi.h>
#include "pact-cpp.h"

using namespace Napi;

PactSpecification integerToSpecification(Napi::Env &env, uint32_t number) {
  PactSpecification specification = PactSpecification::PactSpecification_V2;

  switch(number) {
    case 0:
      specification = PactSpecification::PactSpecification_Unknown;
      break;
    case 1:
      specification = PactSpecification::PactSpecification_V1;
      break;
    case 2:
      specification = PactSpecification::PactSpecification_V1_1;
      break;
    case 3:
      specification = PactSpecification::PactSpecification_V2;
      break;
    case 4:
      specification = PactSpecification::PactSpecification_V3;
      break;
    case 5:
      specification = PactSpecification::PactSpecification_V4;
      break;
    default:
      std::string err =  "Unable to parse pact specification: ";
      err += number;

      throw Napi::Error::New(env, err);
  }

  return specification;
}

InteractionPart integerToInteractionPart(Napi::Env &env, uint32_t number) {
  InteractionPart part = InteractionPart::InteractionPart_Request;

  switch(number) {
    case 0:
      part = InteractionPart::InteractionPart_Request;
      break;
    case 1:
      part = InteractionPart::InteractionPart_Response;
      break;
    default:
      std::string err =  "Unable to parse pact interaction part: ";
      err += number;

      throw Napi::Error::New(env, err);
  }

  return part;
}

/**
 * Fetch the in-memory logger buffer contents. This will only have any contents if the `buffer`
 * sink has been configured to log to. The contents will be allocated on the heap and will need
 * to be freed with `string_delete`.
 *
 * Fetches the logs associated with the provided identifier, or uses the "global" one if the
 * identifier is not specified (i.e. NULL).
 *
 * Returns a NULL pointer if the buffer can't be fetched. This can occur is there is not
 * sufficient memory to make a copy of the contents or the buffer contains non-UTF-8 characters.
 *
 * # Safety
 *
 * This function will fail if the log_id pointer is invalid or does not point to a NULL
 * terminated string.
 *
 * C interface:
 *
 *     const char *pactffi_fetch_log_buffer(const char *log_id);
 */
Napi::Value PactffiFetchLogBuffer(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiFetchLogBuffer received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiFetchLogBuffer(log_id) expected a string");
  }

  std::string log_id = info[0].As<Napi::String>().Utf8Value();

  const char* buffer = pactffi_fetch_log_buffer(log_id.c_str());

  return Napi::String::New(env, buffer);
}

/**
 * Delete a string previously returned by this FFI.
 *
 * It is explicitly allowed to pass a null pointer to this function;
 * in that case the function will do nothing.
 *
 * C interface:
 *
 *     void pactffi_string_delete(char *string);
 */
Napi::Value PactffiStringDelete(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiStringDelete received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiStringDelete(str) expected a string");
  }

  throw Napi::Error::New(env, "PactffiStringDelete(str) is unimplemented");

  return info.Env().Undefined();
}

/**
 * External interface to check if a mock server has matched all its requests. The port number is
 * passed in, and if all requests have been matched, true is returned. False is returned if there
 * is no mock server on the given port, or if any request has not been successfully matched, or
 * the method panics.
 *
 * C interface:
 *
 *    bool pactffi_mock_server_matched(int32_t mock_server_port);
 */
Napi::Value PactffiMockServerMatched(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMockServerMatched received < 1 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMockServerMatched(port) expected a number");
  }

  int32_t port = info[0].As<Napi::Number>().Int32Value();

  bool res = pactffi_mock_server_matched(port);

  return Napi::Boolean::New(env, res);
}

/**
 * External interface to get all the mismatches from a mock server. The port number of the mock
 * server is passed in, and a pointer to a C string with the mismatches in JSON format is
 * returned.
 *
 * **NOTE:** The JSON string for the result is allocated on the heap, and will have to be freed
 * once the code using the mock server is complete. The [`cleanup_mock_server`](fn.cleanup_mock_server.html) function is
 * provided for this purpose.
 *
 * # Errors
 *
 * If there is no mock server with the provided port number, or the function panics, a NULL
 * pointer will be returned. Don't try to dereference it, it will not end well for you.
 *
 * C interface:
 *
 *    char *pactffi_mock_server_mismatches(int32_t mock_server_port);
 */
Napi::Value PactffiMockServerMismatches(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMockServerMismatches received < 1 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMockServerMismatches(port) expected a number");
  }

  int32_t port = info[0].As<Napi::Number>().Int32Value();
  char* res = pactffi_mock_server_mismatches(port);

  return Napi::String::New(env, res);
}

/**
 * External interface to create a mock server. A Pact handle is passed in,
 * as well as the port for the mock server to run on. A value of 0 for the port will result in a
 * port being allocated by the operating system. The port of the mock server is returned.
 *
 * * `pact` - Handle to a Pact model
 * * `addr_str` - Address to bind to in the form name:port (i.e. 127.0.0.1:0)
 * * `tls` - boolean flag to indicate of the mock server should use TLS (using a self-signed certificate)
 *
 * # Errors
 *
 * Errors are returned as negative values.
 *
 * | Error | Description |
 * |-------|-------------|
 * | -1 | An invalid handle was received |
 * | -3 | The mock server could not be started |
 * | -4 | The method panicked |
 * | -5 | The address is not valid |
 * | -6 | Could not create the TLS configuration with the self-signed certificate |
 *
 * C interface:
 *
 *    int32_t pactffi_create_mock_server_for_pact(PactHandle pact, const char *addr_str, bool tls);
 */
Napi::Value PactffiCreateMockServerForPact(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForPact received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForPact(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForPact(arg 1) expected a string");
  }

  if (!info[2].IsBoolean()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForPact(arg 2) expected a boolean");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();
  std::string addr = info[1].As<Napi::String>().Utf8Value();
  bool tls = info[2].As<Napi::Boolean>().Value();

  // int32_t pactffi_create_mock_server_for_pact(PactHandle pact, const char *addr_str, bool tls);

  uint16_t result = pactffi_create_mock_server_for_pact(pact, addr.c_str(), tls);

  return Number::New(env, result);
}

/**
 * Create a mock server for the provided Pact handle and transport. If the transport is not
 * provided (it is a NULL pointer or an empty string), will default to an HTTP transport. The
 * address is the interface bind to, and will default to the loopback adapter if not specified.
 * Specifying a value of zero for the port will result in the operating system allocating the port.
 *
 * Parameters:
 * * `pact` - Handle to a Pact model created with created with `pactffi_new_pact`.
 * * `addr` - Address to bind to (i.e. `127.0.0.1` or `[::1]`). Must be a valid UTF-8 NULL-terminated string, or NULL or empty, in which case the loopback adapter is used.
 * * `port` - Port number to bind to. A value of zero will result in the operating system allocating an available port.
 * * `transport` - The transport to use (i.e. http, https, grpc). Must be a valid UTF-8 NULL-terminated string, or NULL or empty, in which case http will be used.
 * * `transport_config` - (OPTIONAL) Configuration for the transport as a valid JSON string. Set to NULL or empty if not required.
 *
 * The port of the mock server is returned.
 *
 * # Safety
 * NULL pointers or empty strings can be passed in for the address, transport and transport_config,
 * in which case a default value will be used. Passing in an invalid pointer will result in undefined behaviour.
 *
 * # Errors
 *
 * Errors are returned as negative values.
 *
 * | Error | Description |
 * |-------|-------------|
 * | -1 | An invalid handle was received. Handles should be created with `pactffi_new_pact` |
 * | -2 | transport_config is not valid JSON |
 * | -3 | The mock server could not be started |
 * | -4 | The method panicked |
 * | -5 | The address is not valid |
 *
 * C interface:
 *
 *    int32_t pactffi_create_mock_server_for_transport(PactHandle pact,
 *                                                     const char *addr,
 *                                                     uint16_t port,
 *                                                     const char *transport,
 *                                                     const char *transport_config);
 */
Napi::Value PactffiCreateMockServerForTransport(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForTransport received < 5 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForTransport(arg 0) expected a PactHandle (uint16_t)");
  }
  
  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForTransport(arg 1) expected a string");
  }

  if (!info[2].IsNumber()) {
    throw Napi::Error::New(env, "PactffiCleanupMockServer(arg 2) expected a number");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForTransport(arg 3) expected a string");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "PactffiCreateMockServerForTransport(arg 4) expected a string");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();
  std::string addr = info[1].As<Napi::String>().Utf8Value();
  uint32_t port = info[2].As<Napi::Number>().Int32Value();
  std::string transport = info[3].As<Napi::String>().Utf8Value();
  std::string config = info[4].As<Napi::String>().Utf8Value();

  uint32_t result = pactffi_create_mock_server_for_transport(pact, addr.c_str(), port, transport.c_str(), config.c_str());

  return Number::New(env, result);
}

/**
 * External interface to cleanup a mock server. This function will try terminate the mock server
 * with the given port number and cleanup any memory allocated for it. Returns true, unless a
 * mock server with the given port number does not exist, or the function panics.
 *
 * C interface:
 *
 *    bool pactffi_cleanup_mock_server(int32_t mock_server_port);
 */
Napi::Value PactffiCleanupMockServer(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiCleanupMockServer received < 1 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiCleanupMockServer(arg 0) expected a number");
  }

  uint32_t port = info[0].As<Napi::Number>().Int32Value();

  bool res = pactffi_cleanup_mock_server(port);

  return Napi::Boolean::New(env, res);
}

/**
 * External interface to write out the pact file. This function should
 * be called if all the consumer tests have passed. The directory to write the file to is passed
 * as the second parameter. If a NULL pointer is passed, the current working directory is used.
 *
 * If overwrite is true, the file will be overwritten with the contents of the current pact.
 * Otherwise, it will be merged with any existing pact file.
 *
 * Returns 0 if the pact file was successfully written. Returns a positive code if the file can
 * not be written or the function panics.
 *
 * # Safety
 *
 * The directory parameter must either be NULL or point to a valid NULL terminated string.
 *
 * # Errors
 *
 * Errors are returned as positive values.
 *
 * | Error | Description |
 * |-------|-------------|
 * | 1 | The function panicked. |
 * | 2 | The pact file was not able to be written. |
 * | 3 | The pact for the given handle was not found. |
 *
 * C Interface:
 *
 *     int32_t pactffi_pact_handle_write_file(PactHandle pact, const char *directory, bool overwrite);
 */
Napi::Value PactffiWritePactFile(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiWritePactFile received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWritePactFile(arg 0) expected a PactHandle (uint16_t");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiWritePactFile(arg 1) expected a string");
  }

  if (!info[2].IsBoolean()) {
    throw Napi::Error::New(env, "PactffiWritePactFile(arg 2) expected a boolean");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();
  std::string dir = info[1].As<Napi::String>().Utf8Value();
  bool overwrite = info[2].As<Napi::Boolean>().Value();

  int32_t res = pactffi_pact_handle_write_file(pact, dir.c_str(), overwrite);

  return Number::New(env, res);
}

/**
 * External interface to trigger a mock server to write out its pact file. This function should
 * be called if all the consumer tests have passed. The directory to write the file to is passed
 * as the second parameter. If a NULL pointer is passed, the current working directory is used.
 *
 * If overwrite is true, the file will be overwritten with the contents of the current pact.
 * Otherwise, it will be merged with any existing pact file.
 *
 * Returns 0 if the pact file was successfully written. Returns a positive code if the file can
 * not be written, or there is no mock server running on that port or the function panics.
 *
 * # Errors
 *
 * Errors are returned as positive values.
 *
 * | Error | Description |
 * |-------|-------------|
 * | 1 | A general panic was caught |
 * | 2 | The pact file was not able to be written |
 * | 3 | A mock server with the provided port was not found |
 *
 * C Interface:
 *
 *    int32_t pactffi_write_pact_file(int32_t mock_server_port, const char *directory, bool overwrite);
 */
Napi::Value PactffiWritePactFileByPort(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiWritePactFileByPort received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWritePactFileByPort(arg 0) expected a number");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiWritePactFileByPort(arg 1) expected a string");
  }

  if (!info[2].IsBoolean()) {
    throw Napi::Error::New(env, "PactffiWritePactFileByPort(arg 2) expected a boolean");
  }

  int32_t port = info[0].As<Napi::Number>().Int32Value();
  std::string dir = info[1].As<Napi::String>().Utf8Value();
  bool overwrite = info[2].As<Napi::Boolean>().Value();

  int32_t res = pactffi_write_pact_file(port, dir.c_str(), overwrite);

  return Number::New(env, res);
}

/**
 * Creates a new Pact model and returns a handle to it.
 *
 * * `consumer_name` - The name of the consumer for the pact.
 * * `provider_name` - The name of the provider for the pact.
 *
 * Returns a new `PactHandle`. The handle will need to be freed with the `pactffi_free_pact_handle`
 * method to release its resources.
 *
 * C interface:
 *
 *    PactHandle pactffi_new_pact(const char *consumer_name, const char *provider_name);
 */
Napi::Value PactffiNewPact(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiNewPact received < 2 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiNewPact(arg 0) expected a string");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiNewPact(arg 1) expected a string");
  }

  std::string consumer = info[0].As<Napi::String>().Utf8Value();
  std::string provider = info[1].As<Napi::String>().Utf8Value();

  PactHandle pact = pactffi_new_pact(consumer.c_str(), provider.c_str());

  return Number::New(env, pact);
}

/**
 * Creates a new HTTP Interaction and returns a handle to it.
 *
 * * `description` - The interaction description. It needs to be unique for each interaction.
 *
 * Returns a new `InteractionHandle`.
 *
 * C interface:
 *
 *    InteractionHandle pactffi_new_interaction(PactHandle pact, const char *description);
 */
Napi::Value PactffiNewInteraction(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiNewInteraction received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiNewInteraction(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiNewInteraction(arg 1) expected a string");
  }

  PactHandle pact = info[0].As<Napi::Number>().Uint32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();

  InteractionHandle handle = pactffi_new_interaction(pact, description.c_str());

  return Number::New(env, handle);
}

/**
 * Sets the description for the Interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `description` - The interaction description. It needs to be unique for each interaction.
 *
 * C interface:
 *
 *    bool pactffi_upon_receiving(InteractionHandle interaction, const char *description);
 */
Napi::Value PactffiUponReceiving(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiUponReceiving received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiUponReceiving(arg 0) expected a InteractionHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiUponReceiving(arg 1) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();

  bool res = pactffi_upon_receiving(interaction, description.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Adds a provider state to the Interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `description` - The provider state description. It needs to be unique.
 *
 * C interface:
 *
 *    bool pactffi_given(InteractionHandle interaction, const char *description);
 */
Napi::Value PactffiGiven(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiGiven received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiGiven(arg 0) expected a InteractionHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiGiven(arg 1) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();

  bool res = pactffi_given(interaction, description.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Write the `description` field on the `SynchronousMessage`.
 *
 * # Safety
 *
 * `description` must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * This function will only reallocate if the new string
 * does not fit in the existing buffer.
 *
 * # Error Handling
 *
 * Errors will be reported with a non-zero return value.
 *
 * C interface:
 *
 *    int pactffi_sync_message_set_description(struct SynchronousMessage *message,
 *                                            const char *description);
 */
// Napi::Value PactffiSyncMessageSetDescription(const Napi::CallbackInfo& info) {
//    Napi::Env env = info.Env();

//   if (info.Length() < 2) {
//     throw Napi::Error::New(env, "PactffiSyncMessageSetDescription received < 2 arguments");
//   }

//   if (!info[0].IsNumber()) {
//     throw Napi::Error::New(env, "PactffiSyncMessageSetDescription(arg 0) expected a InteractionHandle (uint32_t)");
//   }

//   if (!info[1].IsString()) {
//     throw Napi::Error::New(env, "PactffiSyncMessageSetDescription(arg 1) expected a string");
//   }

//   SynchronousMessage interaction = info[0].As<Napi::Number>().Uint32Value();
//   std::string description = info[1].As<Napi::String>().Utf8Value();

//   int res = pactffi_sync_message_set_description(interaction, description.c_str());

//   return Number::New(env, res);
// }

/**
 * Adds a provider state to the Interaction with a parameter key and value. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `description` - The provider state description. It needs to be unique.
 * * `name` - Parameter name.
 * * `value` - Parameter value.
 *
 * C interface:
 *
 * bool pactffi_given_with_param(InteractionHandle interaction,
 *                               const char *description,
 *                               const char *name,
 *                               const char *value);
 */
Napi::Value PactffiGivenWithParam(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiGivenWithParam received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiGivenWithParam(arg 0) expected a InteractionHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiGivenWithParam(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiGivenWithParam(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiGivenWithParam(arg 3) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();
  std::string name = info[2].As<Napi::String>().Utf8Value();
  std::string value = info[3].As<Napi::String>().Utf8Value();

  bool res = pactffi_given_with_param(interaction, description.c_str(), name.c_str(), value.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Configures the request for the Interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `method` - The request method. Defaults to GET.
 * * `path` - The request path. Defaults to `/`.
 *
 * C interface:
 *
 *    bool pactffi_with_request(InteractionHandle interaction, const char *method, const char *path);
 */
Napi::Value PactffiWithRequest(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiWithRequest received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithRequest(arg 0) expected a InteractionHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiWithRequest(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiWithRequest(arg 2) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  std::string method = info[1].As<Napi::String>().Utf8Value();
  std::string path = info[2].As<Napi::String>().Utf8Value();

  bool res = pactffi_with_request(interaction, method.c_str(), path.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Configures a query parameter for the Interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `name` - the query parameter name.
 * * `value` - the query parameter value.
 * * `index` - the index of the value (starts at 0). You can use this to create a query parameter with multiple values
 *
 * C interface:
 *
 *    bool pactffi_with_query_parameter(InteractionHandle interaction, const char *name, size_t index, const char *value);
 */
Napi::Value PactffiWithQueryParameter(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiWithQueryParameter received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithQueryParameter(arg 0) expected a InteractionHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiWithQueryParameter(arg 1) expected a string");
  }

  if (!info[2].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithQueryParameter(arg 2) expected a number");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiWithQueryParameter(arg 3) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  std::string name = info[1].As<Napi::String>().Utf8Value();
  size_t index = info[2].As<Napi::Number>().Uint32Value();
  std::string value = info[3].As<Napi::String>().Utf8Value();

  bool res = pactffi_with_query_parameter(interaction, name.c_str(), index, value.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Sets the specification version for a given Pact model. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started) or the version is invalid
 *
 * * `pact` - Handle to a Pact model
 * * `version` - the spec version to use
 *
 * C interface:
 *
 *    bool pactffi_with_specification(PactHandle pact, PactSpecification version);
 */
Napi::Value PactffiWithSpecification(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiWithSpecification received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithSpecification(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithSpecification(arg 1) expected a number");
  }

  PactHandle pact = info[0].As<Napi::Number>().Uint32Value();
  uint32_t specificationNumber = info[1].As<Napi::Number>().Uint32Value();
  PactSpecification specification = integerToSpecification(env, specificationNumber);

  bool res = pactffi_with_specification(pact, specification);

  return Napi::Boolean::New(env, res);
}

/**
 * Sets the additional metadata on the Pact file. Common uses are to add the client library details such as the name and version
 * Returns false if the interaction or Pact can't be modified (i.e. the mock server for it has already started)
 *
 * * `pact` - Handle to a Pact model
 * * `namespace` - the top level metadat key to set any key values on
 * * `name` - the key to set
 * * `value` - the value to set
 *
 * C interface:
 *
 *    bool pactffi_with_pact_metadata(PactHandle pact, const char *namespace_, const char *name, const char *value);
 */
Napi::Value PactffiWithPactMetadata(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiWithPactMetadata received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithPactMetadata(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiWithPactMetadata(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiWithPactMetadata(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiWithPactMetadata(arg 3) expected a string");
  }

  PactHandle pact = info[0].As<Napi::Number>().Uint32Value();
  std::string ns = info[1].As<Napi::String>().Utf8Value();
  std::string name = info[2].As<Napi::String>().Utf8Value();
  std::string value = info[3].As<Napi::String>().Utf8Value();

  bool res = pactffi_with_pact_metadata(pact, ns.c_str(), name.c_str(), value.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Configures a header for the Interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `part` - The part of the interaction to add the header to (Request or Response).
 * * `name` - the header name.
 * * `value` - the header value.
 * * `index` - the index of the value (starts at 0). You can use this to create a header with multiple values
 *
 * To setup a header with multiple values, you can either call this function multiple times
 * with a different index value, i.e. to create `x-id=2, 3`
 *
 * ```c
 * pactffi_with_header_v2(handle, InteractionPart::Request, "x-id", 0, "2");
 * pactffi_with_header_v2(handle, InteractionPart::Request, "x-id", 1, "3");
 * ```
 *
 * Or you can call it once with a JSON value that contains multiple values:
 *
 * ```c
 * const char* value = "{\"value\": [\"2\",\"3\"]}";
 * pactffi_with_header_v2(handle, InteractionPart::Request, "x-id", 0, value);
 * ```
 *
 * To include matching rules for the header, include the matching rule JSON format with
 * the value as a single JSON document. I.e.
 *
 * ```c
 * const char* value = "{\"value\":\"2\", \"pact:matcher:type\":\"regex\", \"regex\":\"\\\\d+\"}";
 * pactffi_with_header_v2(handle, InteractionPart::Request, "id", 0, value);
 * ```
 * See [IntegrationJson.md](https://github.com/pact-foundation/pact-reference/blob/master/rust/pact_ffi/IntegrationJson.md)
 *
 * # Safety
 * The name and value parameters must be valid pointers to NULL terminated strings.
 * 
 * C interface:
 * 
 *    bool pactffi_with_header_v2(InteractionHandle interaction,
 *                                enum InteractionPart part,
 *                                const char *name,
 *                                size_t index,
 *                                const char *value);
 */
Napi::Value PactffiWithHeader(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiWithHeader received < 5 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithHeader(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithHeader(arg 1) expected an InteractionPart (uint32_t)");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiWithHeader(arg 2) expected a string");
  }

  if (!info[3].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithHeader(arg 3) expected a number");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "PactffiWithHeader(arg 4) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  uint32_t partNumber = info[1].As<Napi::Number>().Uint32Value();
  InteractionPart part = integerToInteractionPart(env, partNumber);
  std::string name = info[2].As<Napi::String>().Utf8Value();
  size_t index = info[3].As<Napi::Number>().Uint32Value();
  std::string value = info[4].As<Napi::String>().Utf8Value();

  bool res = pactffi_with_header_v2(interaction, part, name.c_str(), index, value.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Adds the body for the interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `part` - The part of the interaction to add the body to (Request or Response).
 * * `content_type` - The content type of the body. Defaults to `text/plain`. Will be ignored if a content type
 *   header is already set.
 * * `body` - The body contents. For JSON payloads, matching rules can be embedded in the body.
 *
 * C interface:
 *
 * bool pactffi_with_body(InteractionHandle interaction,
 *                        InteractionPart part,
 *                        const char *content_type,
 *                        const char *body);
 */
Napi::Value PactffiWithBody(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiWithBody received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithBody(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithBody(arg 1) expected an InteractionPart (uint32_t)");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiWithBody(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiWithBody(arg 3) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  uint32_t partNumber = info[1].As<Napi::Number>().Uint32Value();
  InteractionPart part = integerToInteractionPart(env, partNumber);
  std::string contentType = info[2].As<Napi::String>().Utf8Value();
  std::string body = info[3].As<Napi::String>().Utf8Value();

  bool res = pactffi_with_body(interaction, part, contentType.c_str(), body.c_str());

  return Napi::Boolean::New(env, res);
}

/**
 * Adds a binary file as the body with the expected content type and example contents. Will use
 * a mime type matcher to match the body. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `interaction` - Interaction handle to set the body for.
 * * `part` - Request or response part.
 * * `content_type` - Expected content type.
 * * `body` - example body contents in bytes
 * * `size` - number of bytes in the body
 *
 * C interface:
 *
 * bool pactffi_with_binary_file(InteractionHandle interaction,
 *                               InteractionPart part,
 *                               const char *content_type,
 *                               const uint8_t *body,
 *                               size_t size);
 */
Napi::Value PactffiWithBinaryFile(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiWithBinaryFile received < 5 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithBinaryFile(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithBinaryFile(arg 1) expected an InteractionPart (uint32_t)");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiWithBinaryFile(arg 2) expected a string");
  }

  if (!info[3].IsBuffer()) {
    throw Napi::Error::New(env, "PactffiWithBinaryFile(arg 3) expected a Buffer");
  }

  if (!info[4].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithBinaryFile(arg 4) expected a number");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  uint32_t partNumber = info[1].As<Napi::Number>().Uint32Value();
  InteractionPart part = integerToInteractionPart(env, partNumber);

  std::string contentType = info[2].As<Napi::String>().Utf8Value();
  Napi::Buffer<uint8_t> buffer = info[3].As<Napi::Buffer<uint8_t>>();
  size_t size = info[4].As<Napi::Number>().Uint32Value();
  
  bool res = pactffi_with_binary_file(interaction, part, contentType.c_str(), buffer.Data(), size);

  return Napi::Boolean::New(env, res);
}

/**
 * Adds a binary file as the body as a MIME multipart with the expected content type and example contents. Will use
 * a mime type matcher to match the body. Returns an error if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `interaction` - Interaction handle to set the body for.
 * * `part` - Request or response part.
 * * `content_type` - Expected content type of the file.
 * * `file` - path to the example file
 * * `part_name` - name for the mime part
 *
 * C interface:
 *
 * StringResult pactffi_with_multipart_file(InteractionHandle interaction,
 *                                          InteractionPart part,
 *                                          const char *content_type,
 *                                          const char *file,
 *                                          const char part_name);
 */
Napi::Value PactffiWithMultipartFile(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiWithMultipartFile received < 5 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithMultipartFile(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWithMultipartFile(arg 1) expected an InteractionPart (uint32_t)");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiWithMultipartFile(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiWithMultipartFile(arg 3) expected a string");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "PactffiWithMultipartFile(arg 4) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  uint32_t partNumber = info[1].As<Napi::Number>().Uint32Value();
  InteractionPart part = integerToInteractionPart(env, partNumber);

  std::string contentType = info[2].As<Napi::String>().Utf8Value();
  std::string file = info[3].As<Napi::String>().Utf8Value();
  std::string partName = info[4].As<Napi::String>().Utf8Value();

  StringResult res = pactffi_with_multipart_file(interaction, part, contentType.c_str(), file.c_str(), partName.c_str());

  // TODO: this will also break the https://github.com/pact-foundation/pact-js-core/tree/feat/ffi-consumer/src/consumer branch
  //       which expects a struct
  if (res.tag == StringResult::Tag::StringResult_Ok) {
    return env.Undefined();
  }

  std::string err = "PactffiWithMultipartFile: invalid multipart body specified:";
  err += res.failed._0;

  throw Napi::Error::New(env, err);
}

/**
 * Configures the response for the Interaction. Returns false if the interaction or Pact can't be
 * modified (i.e. the mock server for it has already started)
 *
 * * `status` - the response status. Defaults to 200.
 *
 * C interface:
 *
 *    bool pactffi_response_status(InteractionHandle interaction, unsigned short status);
 */
Napi::Value PactffiResponseStatus(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiResponseStatus received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiResponseStatus(arg 0) expected a number");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiResponseStatus(arg 1) expected a number");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  unsigned short status = info[1].As<Napi::Number>().Uint32Value();

  bool res = pactffi_response_status(interaction, status);

  return Napi::Boolean::New(env, res);
}

/**
 * External interface to write out the message pact file. This function should
 * be called if all the consumer tests have passed. The directory to write the file to is passed
 * as the second parameter. If a NULL pointer is passed, the current working directory is used.
 *
 * If overwrite is true, the file will be overwritten with the contents of the current pact.
 * Otherwise, it will be merged with any existing pact file.
 *
 * Returns 0 if the pact file was successfully written. Returns a positive code if the file can
 * not be written, or there is no mock server running on that port or the function panics.
 *
 * # Errors
 *
 * Errors are returned as positive values.
 *
 * | Error | Description |
 * |-------|-------------|
 * | 1 | The pact file was not able to be written |
 * | 2 | The message pact for the given handle was not found |
 *
 * C interface:
 *
 *    int32_t pactffi_write_message_pact_file(MessagePactHandle pact,
 *                                            const char *directory,
 *                                            bool overwrite);
 */

// Napi::Value PactffiWriteMessagePactFile(const Napi::CallbackInfo& info) {
//    Napi::Env env = info.Env();

//   if (info.Length() < 3) {
//     throw Napi::Error::New(env, "PactffiWriteMessagePactFile received < 3 arguments");
//   }

//   if (!info[0].IsNumber()) {
//     throw Napi::Error::New(env, "PactffiWriteMessagePactFile(arg 0) expected a MessagePactHandle (uint32_t)");
//   }

//   if (!info[1].IsString()) {
//     throw Napi::Error::New(env, "PactffiWriteMessagePactFile(arg 1) expected a string");
//   }

//   if (!info[2].IsBoolean()) {
//     throw Napi::Error::New(env, "PactffiWriteMessagePactFile(arg 2) expected a boolean");
//   }

//   MessagePactHandle handle = info[0].As<Napi::Number>().Uint32Value();
//   std::string dir = info[1].As<Napi::String>().Utf8Value();
//   bool overwrite = info[2].As<Napi::Boolean>().Value();

//   bool res = pactffi_write_message_pact_file(handle, dir.c_str(),  overwrite);

//   return Napi::Number::New(env, res);
// }

/**
 * Sets the additional metadata on the Pact file. Common uses are to add the client library details such as the name and version
 *
 * * `pact` - Handle to a Pact model
 * * `namespace` - the top level metadat key to set any key values on
 * * `name` - the key to set
 * * `value` - the value to set
 *
 * C interface:
 *
 *    void pactffi_with_message_pact_metadata(MessagePactHandle pact,
 *                                            const char *namespace_,
 *                                            const char *name,
 *                                            const char *value);
 */
// Napi::Value PactffiWithMessagePactMetadata(const Napi::CallbackInfo& info) {
//    Napi::Env env = info.Env();

//   if (info.Length() < 4) {
//     throw Napi::Error::New(env, "PactffiWithMessagePactMetadata received < 4 arguments");
//   }

//   if (!info[0].IsNumber()) {
//     throw Napi::Error::New(env, "PactffiWithMessagePactMetadata(arg 0) expected a MessagePactHandle (uint32_t)");
//   }

//   if (!info[1].IsString()) {
//     throw Napi::Error::New(env, "PactffiWithMessagePactMetadata(arg 1) expected a string");
//   }

//   if (!info[2].IsString()) {
//     throw Napi::Error::New(env, "PactffiWithMessagePactMetadata(arg 2) expected a string");
//   }

//   if (!info[3].IsString()) {
//     throw Napi::Error::New(env, "PactffiWithMessagePactMetadata(arg 3) expected a string");
//   }

//   MessagePactHandle handle = info[0].As<Napi::Number>().Uint32Value();
//   std::string ns = info[1].As<Napi::String>().Utf8Value();
//   std::string name = info[2].As<Napi::String>().Utf8Value();
//   std::string value = info[3].As<Napi::String>().Utf8Value();

//   pactffi_with_message_pact_metadata(handle, ns.c_str(), name.c_str(), value.c_str());

//   return env.Undefined();
// }

/**
 * Creates a new Pact Message model and returns a handle to it.
 *
 * * `consumer_name` - The name of the consumer for the pact.
 * * `provider_name` - The name of the provider for the pact.
 *
 * Returns a new `MessagePactHandle`. The handle will need to be freed with the `pactffi_free_message_pact_handle`
 * function to release its resources.
 *
 * C interface:
 *
 *    MessagePactHandle pactffi_new_message_pact(const char *consumer_name,
 *                                               const char *provider_name);
 *
 */
// Napi::Value PactffiNewMessagePact(const Napi::CallbackInfo& info) {
//    Napi::Env env = info.Env();

//   if (info.Length() < 2) {
//     throw Napi::Error::New(env, "PactffiNewMessagePact received < 2 arguments");
//   }

//   if (!info[0].IsString()) {
//     throw Napi::Error::New(env, "PactffiNewMessagePact(arg 0) expected a string");
//   }

//   if (!info[1].IsString()) {
//     throw Napi::Error::New(env, "PactffiNewMessagePact(arg 1) expected a string");
//   }

//   std::string consumer = info[0].As<Napi::String>().Utf8Value();
//   std::string provider = info[1].As<Napi::String>().Utf8Value();

//   MessagePactHandle handle = pactffi_new_message_pact(consumer.c_str(), provider.c_str());

//   return Napi::Number::New(env, handle);
// }

/**
 * Creates a new V4 asynchronous message and returns a handle to it.
 *
 * * `description` - The message description. It needs to be unique for each Message.
 *
 * Returns a new `MessageHandle`.
 *
 * C interface:
 *
 *     MessageHandle pactffi_new_async_message(PactHandle pact, const char *description);
 *
 */
Napi::Value PactffiNewAsyncMessage(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiNewAsyncMessage received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiNewAsyncMessage(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiNewAsyncMessage(arg 1) expected a string");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();

  MessageHandle handle = pactffi_new_async_message(pact, description.c_str());

  return Napi::Number::New(env, handle);
}

/**
 * Creates a new synchronous message interaction (request/response) and return a handle to it
 * * `description` - The interaction description. It needs to be unique for each interaction.
 *
 * Returns a new `InteractionHandle`.
 *
 * C interface:
 *
 *    InteractionHandle pactffi_new_sync_message_interaction(PactHandle pact, const char *description);
 *
 */
Napi::Value PactffiNewSyncMessage(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiNewSyncMessage received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiNewSyncMessage(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiNewSyncMessage(arg 1) expected a string");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();

  InteractionHandle handle = pactffi_new_sync_message_interaction(pact, description.c_str());

  return Napi::Number::New(env, handle);
}

/**
 * Creates a new Message and returns a handle to it.
 *
 * * `description` - The message description. It needs to be unique for each Message.
 *
 * Returns a new `MessageHandle`.
 *
 * C interface:
 *
 *    MessageHandle pactffi_new_message(MessagePactHandle pact, const char *description);
 *
 */
// Napi::Value PactffiNewMessage(const Napi::CallbackInfo& info) {
//    Napi::Env env = info.Env();

//   if (info.Length() < 2) {
//     throw Napi::Error::New(env, "PactffiNewMessage received < 2 arguments");
//   }

//   if (!info[0].IsNumber()) {
//     throw Napi::Error::New(env, "PactffiNewMessage(arg 0) expected a MessagePactHandle (uint32_t)");
//   }

//   if (!info[1].IsString()) {
//     throw Napi::Error::New(env, "PactffiNewMessage(arg 1) expected a string");
//   }

//   MessagePactHandle handle = info[0].As<Napi::Number>().Uint32Value();
//   std::string desc = info[1].As<Napi::String>().Utf8Value();

//   MessageHandle res = pactffi_new_message(handle, desc.c_str());

//   return Napi::Number::New(env, res);
// }

/**
 * Sets the description for the Message.
 *
 * * `description` - The message description. It needs to be unique for each message.
 *
 * C interface:
 *
 * void pactffi_message_expects_to_receive(MessageHandle message, const char *description);
 */
Napi::Value PactffiMessageExpectsToReceive(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiMessageExpectsToReceive received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageExpectsToReceive(arg 0) expected a MessageHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageExpectsToReceive(arg 1) expected a string");
  }

  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();
  std::string desc = info[1].As<Napi::String>().Utf8Value();

  pactffi_message_expects_to_receive(handle, desc.c_str());

  return env.Undefined();
}

/**
 * Adds a provider state to the Interaction.
 *
 * C interface:
 *
 * * `description` - The provider state description. It needs to be unique for each message
 *
 * C interface:
 *
 *    void pactffi_message_given(MessageHandle message, const char *description);
 */
Napi::Value PactffiMessageGiven(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiMessageGiven received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageGiven(arg 0) expected a MessageHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageGiven(arg 1) expected a string");
  }
  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();
  std::string desc = info[1].As<Napi::String>().Utf8Value();

  pactffi_message_given(handle, desc.c_str());

  return env.Undefined();
}

/**
 * Adds a provider state to the Message with a parameter key and value.
 *
 * * `description` - The provider state description. It needs to be unique.
 * * `name` - Parameter name.
 * * `value` - Parameter value.
 *
 * C interface:
 *
 *     void pactffi_message_given_with_param(MessageHandle message,
 *                                           const char *description,
 *                                           const char *name,
 *                                           const char *value);
 */
Napi::Value PactffiMessageGivenWithParam(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiMessageGivenWithParam received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageGivenWithParam(arg 0) expected a MessageHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageGivenWithParam(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageGivenWithParam(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageGivenWithParam(arg 3) expected a string");
  }

  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();
  std::string desc = info[1].As<Napi::String>().Utf8Value();
  std::string name = info[2].As<Napi::String>().Utf8Value();
  std::string value = info[3].As<Napi::String>().Utf8Value();

  pactffi_message_given_with_param(handle, desc.c_str(), name.c_str(), value.c_str());

  return env.Undefined();
}

/**
 * Adds the contents of the Message.
 *
 * Accepts JSON, binary and other payload types. Binary data will be base64 encoded when serialised.
 *
 * Note: For text bodies (plain text, JSON or XML), you can pass in a C string (NULL terminated)
 * and the size of the body is not required (it will be ignored). For binary bodies, you need to
 * specify the number of bytes in the body.
 *
 * * `content_type` - The content type of the body. Defaults to `text/plain`, supports JSON structures with matchers and binary data.
 * * `body` - The body contents as bytes. For text payloads (JSON, XML, etc.), a C string can be used and matching rules can be embedded in the body.
 * * `content_type` - Expected content type (e.g. application/json, application/octet-stream)
 * * `size` - number of bytes in the message body to read. This is not required for text bodies (JSON, XML, etc.).
 *
 * C interface:
 *
 *     void pactffi_message_with_contents(MessageHandle message_handle,
 *                                        const char *content_type,
 *                                        const uint8_t *body,
 *                                        size_t size);
 */
Napi::Value PactffiMessageWithBinaryContents(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiMessageWithBinaryContents received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageWithBinaryContents(arg 0) expected a MessageHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageWithBinaryContents(arg 1) expected a string");
  }

  if (!info[2].IsBuffer()) {
    throw Napi::Error::New(env, "PactffiMessageWithBinaryContents(arg 2) expected a Buffer");
  }

  if (!info[3].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageWithBinaryContents(arg 3) expected a number");
  }

  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();
  std::string contentType = info[1].As<Napi::String>().Utf8Value();
  Napi::Buffer<uint8_t> buffer = info[2].As<Napi::Buffer<uint8_t>>();
  size_t size = info[3].As<Napi::Number>().Uint32Value();
   
  pactffi_message_with_contents(handle, contentType.c_str(), buffer.Data(), size);

  return env.Undefined();
}

/**
 * Adds the contents of the Message.
 *
 * Accepts text bodies (plain text, JSON or XML). Bodies must be a valid C string (NULL terminated)
 * and the size of the body is not required (it will be ignored). 
 *
 * * `content_type` - The content type of the body. Defaults to `text/plain`, supports JSON structures with matchers and binary data.
 * * `body` - The body contents as bytes. For text payloads (JSON, XML, etc.), a C string can be used and matching rules can be embedded in the body.
 * * `content_type` - Expected content type (e.g. application/json, application/octet-stream)
 * * `size` - number of bytes in the message body to read. This is not required for text bodies (JSON, XML, etc.).
 *
 * C interface:
 *
 *     void pactffi_message_with_contents(MessageHandle message_handle,
 *                                        const char *content_type,
 *                                        const uint8_t *body,
 *                                        size_t size);
 */
Napi::Value PactffiMessageWithContents(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiMessageWithContents received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageWithContents(arg 0) expected a MessageHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageWithContents(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageWithContents(arg 2) expected a string");
  }

  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();
  std::string contentType = info[1].As<Napi::String>().Utf8Value();
  std::string buffer = info[2].As<Napi::String>().Utf8Value();

  pactffi_message_with_contents(handle, contentType.c_str(), (unsigned char *)buffer.c_str(), 0);

  return env.Undefined();
}

/**
 * Adds expected metadata to the Message
 *
 * * `key` - metadata key
 * * `value` - metadata value.
 *
 * C interface:
 *
 * void pactffi_message_with_metadata(MessageHandle message_handle,
 *                                    const char *key,
 *                                    const char *value);
 */
Napi::Value PactffiMessageWithMetadata(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiMessageWithMetadata received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageWithMetadata(arg 0) expected a MessageHandle (uint32_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageWithMetadata(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageWithMetadata(arg 2) expected a string");
  }

  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();
  std::string key = info[1].As<Napi::String>().Utf8Value();
  std::string value = info[2].As<Napi::String>().Utf8Value();

  pactffi_message_with_metadata(handle, key.c_str(), value.c_str());

  return env.Undefined();
}

/**
 * Reifies the given message
 *
 * Reification is the process of stripping away any matchers, and returning the original contents.
 * NOTE: the returned string needs to be deallocated with the `free_string` function
 *
 * C interface:
 *
 *    const char *pactffi_message_reify(MessageHandle message_handle);
 */
Napi::Value PactffiMessageReify(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMessageReify received < 1 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiMessageReify(arg 0) expected a MessageHandle (uint32_t)");
  }

  MessageHandle handle = info[0].As<Napi::Number>().Uint32Value();

  auto res = pactffi_message_reify(handle);

  return Napi::String::New(env, res);
}

/**
 * Add a plugin to be used by the test. The plugin needs to be installed correctly for this
 * function to work.
 *
 * * `plugin_name` is the name of the plugin to load.
 * * `plugin_version` is the version of the plugin to load. It is optional, and can be NULL.
 *
 * Returns zero on success, and a positive integer value on failure.
 *
 * Note that plugins run as separate processes, so will need to be cleaned up afterwards by
 * calling `pactffi_cleanup_plugins` otherwise you have plugin processes left running.
 *
 * # Safety
 *
 * `plugin_name` must be a valid pointer to a NULL terminated string. `plugin_version` may be null,
 * and if not NULL must also be a valid pointer to a NULL terminated string.
 *
 * # Errors
 *
 * * `1` - A general panic was caught.
 * * `2` - Failed to load the plugin.
 * * `3` - Pact Handle is not valid.
 *
 * When an error errors, LAST_ERROR will contain the error message.
 *
 * C interface:
 *
 *    unsigned int pactffi_using_plugin(PactHandle pact,
 *                                      const char *plugin_name,
 *                                      const char *plugin_version);
 */
Napi::Value PactffiUsingPlugin(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiUsingPlugin received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiUsingPlugin(arg 0) expected a PactHandle (uint16_t)");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiUsingPlugin(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiUsingPlugin(arg 2) expected a string");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();
  std::string name = info[1].As<Napi::String>().Utf8Value();
  std::string version = info[2].As<Napi::String>().Utf8Value();

  uint16_t result = pactffi_using_plugin(pact, name.c_str(), version.c_str());

  return Number::New(env, result);
}

/**
 * Decrement the access count on any plugins that are loaded for the Pact. This will shutdown
 * any plugins that are no longer required (access count is zero).
 *
 * C interface:
 *
 *    void pactffi_cleanup_plugins(PactHandle pact);
 */
Napi::Value PactffiCleanupPlugins(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiUsingPlugin received < 1 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiUsingPlugin(arg 0) expected a PactHandle (uint16_t)");
  }

  PactHandle pact = info[0].As<Napi::Number>().Int32Value();

  pactffi_cleanup_plugins(pact);

  return env.Undefined();
}

/**
 * Setup the interaction part using a plugin. The contents is a JSON string that will be passed on to
 * the plugin to configure the interaction part. Refer to the plugin documentation on the format
 * of the JSON contents.
 *
 * Returns zero on success, and a positive integer value on failure.
 *
 * * `interaction` - Handle to the interaction to configure.
 * * `part` - The part of the interaction to configure (request or response). It is ignored for messages.
 * * `content_type` - NULL terminated C string of the content type of the part.
 * * `contents` - NULL terminated C string of the JSON contents that gets passed to the plugin.
 *
 * # Safety
 *
 * `content_type` and `contents` must be a valid pointers to NULL terminated strings.
 *
 * # Errors
 *
 * * `1` - A general panic was caught.
 * * `2` - The mock server has already been started.
 * * `3` - The interaction handle is invalid.
 * * `4` - The content type is not valid.
 * * `5` - The contents JSON is not valid JSON.
 * * `6` - The plugin returned an error.
 *
 * When an error errors, LAST_ERROR will contain the error message.
 *
 * C interface:
 *
 * unsigned int pactffi_interaction_contents(InteractionHandle interaction,
 *                                           InteractionPart part,
 *                                           const char *content_type,
 *                                           const char *contents);
 */
Napi::Value PactffiPluginInteractionContents(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();

  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiPluginInteractionContents received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiPluginInteractionContents(arg 0) expected a InteractionHandle (uint32_t)");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiPluginInteractionContents(arg 1) expected an InteractionPart (uint32_t)");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiPluginInteractionContents(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiPluginInteractionContents(arg 3) expected a string");
  }

  InteractionHandle interaction = info[0].As<Napi::Number>().Uint32Value();
  uint32_t partNumber = info[1].As<Napi::Number>().Uint32Value();
  InteractionPart part = integerToInteractionPart(env, partNumber);
  std::string contentType = info[2].As<Napi::String>().Utf8Value();
  std::string contents = info[3].As<Napi::String>().Utf8Value();

  bool res = pactffi_interaction_contents(interaction, part, contentType.c_str(), contents.c_str());

  return Napi::Boolean::New(env, res);
}

/*
// GetMessageContents retreives the binary contents of the request for a given message
// any matchers are stripped away if given
// if the contents is from a plugin, the byte[] representation of the parsed
// plugin data is returned, again, with any matchers etc. removed
func (m *Message) GetMessageRequestContents() ([]byte, error) {
	log.Println("[DEBUG] GetMessageRequestContents")
	if m.messageType == MESSAGE_TYPE_ASYNC {
		iter := C.pactffi_pact_handle_get_message_iter(m.pact.handle)
		log.Println("[DEBUG] pactffi_pact_handle_get_message_iter")
		if iter == nil {
			return nil, errors.New("unable to get a message iterator")
		}
		log.Println("[DEBUG] pactffi_pact_handle_get_message_iter - OK")

		///////
		// TODO: some debugging in here to see what's exploding.......
		///////

		log.Println("[DEBUG] pactffi_pact_handle_get_message_iter - len", len(m.server.messages))

		for i := 0; i < len(m.server.messages); i++ {
			log.Println("[DEBUG] pactffi_pact_handle_get_message_iter - index", i)
			message := C.pactffi_pact_message_iter_next(iter)
			log.Println("[DEBUG] pactffi_pact_message_iter_next - message", message)

			if i == m.index {
				log.Println("[DEBUG] pactffi_pact_message_iter_next - index match", message)

				if message == nil {
					return nil, errors.New("retreived a null message pointer")
				}

				len := C.pactffi_message_get_contents_length(message)
				log.Println("[DEBUG] pactffi_message_get_contents_length - len", len)
				if len == 0 {
					return nil, errors.New("retreived an empty message")
				}
				data := C.pactffi_message_get_contents_bin(message)
				log.Println("[DEBUG] pactffi_message_get_contents_bin - data", data)
				if data == nil {
					return nil, errors.New("retreived an empty pointer to the message contents")
				}
				ptr := unsafe.Pointer(data)
				bytes := C.GoBytes(ptr, C.int(len))

				return bytes, nil
			}
		}

	} else {
		iter := C.pactffi_pact_handle_get_sync_message_iter(m.pact.handle)
		if iter == nil {
			return nil, errors.New("unable to get a message iterator")
		}

		for i := 0; i < len(m.server.messages); i++ {
			message := C.pactffi_pact_sync_message_iter_next(iter)

			if i == m.index {
				if message == nil {
					return nil, errors.New("retreived a null message pointer")
				}

				len := C.pactffi_sync_message_get_request_contents_length(message)
				if len == 0 {
					return nil, errors.New("retreived an empty message")
				}
				data := C.pactffi_sync_message_get_request_contents_bin(message)
				if data == nil {
					return nil, errors.New("retreived an empty pointer to the message contents")
				}
				ptr := unsafe.Pointer(data)
				bytes := C.GoBytes(ptr, C.int(len))

				return bytes, nil
			}
		}
	}

	return nil, errors.New("unable to find the message")
}

// GetMessageResponseContents retreives the binary contents of the response for a given message
// any matchers are stripped away if given
// if the contents is from a plugin, the byte[] representation of the parsed
// plugin data is returned, again, with any matchers etc. removed
func (m *Message) GetMessageResponseContents() ([][]byte, error) {

	responses := make([][]byte, len(m.server.messages))
	if m.messageType == MESSAGE_TYPE_ASYNC {
		return nil, errors.New("invalid request: asynchronous messages do not have response")
	}
	iter := C.pactffi_pact_handle_get_sync_message_iter(m.pact.handle)
	if iter == nil {
		return nil, errors.New("unable to get a message iterator")
	}

	for i := 0; i < len(m.server.messages); i++ {
		message := C.pactffi_pact_sync_message_iter_next(iter)

		if message == nil {
			return nil, errors.New("retreived a null message pointer")
		}

		// Get Response body
		len := C.pactffi_sync_message_get_response_contents_length(message, C.ulong(i))
		if len == 0 {
			return nil, errors.New("retreived an empty message")
		}
		data := C.pactffi_sync_message_get_response_contents_bin(message, C.ulong(i))
		if data == nil {
			return nil, errors.New("retreived an empty pointer to the message contents")
		}
		ptr := unsafe.Pointer(data)
		bytes := C.GoBytes(ptr, C.int(len))

		responses[i] = bytes
	}

	return responses, nil
}

// StartTransport starts up a mock server on the given address:port for the given transport
// https://docs.rs/pact_ffi/latest/pact_ffi/mock_server/fn.pactffi_create_mock_server_for_transport.html
func (m *MessageServer) StartTransport(transport string, address string, port int, config map[string][]interface{}) (int, error) {
	if len(m.messages) == 0 {
		return 0, ErrNoInteractions
	}

	log.Println("[DEBUG] mock server starting on address:", address, port)
	cAddress := C.CString(address)
	defer free(cAddress)

	cTransport := C.CString(transport)
	defer free(cTransport)

	configJson := stringFromInterface(config)
	cConfig := C.CString(configJson)
	defer free(cConfig)

	p := C.pactffi_create_mock_server_for_transport(m.messagePact.handle, cAddress, C.int(port), cTransport, cConfig)

	// | Error | Description
	// |-------|-------------
	// | -1	   | An invalid handle was received. Handles should be created with pactffi_new_pact
	// | -2	   | transport_config is not valid JSON
	// | -3	   | The mock server could not be started
	// | -4	   | The method panicked
	// | -5	   | The address is not valid
	msPort := int(p)
	switch msPort {
	case -1:
		return 0, ErrInvalidMockServerConfig
	case -2:
		return 0, ErrInvalidMockServerConfig
	case -3:
		return 0, ErrMockServerUnableToStart
	case -4:
		return 0, ErrMockServerPanic
	case -5:
		return 0, ErrInvalidAddress
	default:
		if msPort > 0 {
			log.Println("[DEBUG] mock server running on port:", msPort)
			return msPort, nil
		}
		return msPort, fmt.Errorf("an unknown error (code: %v) occurred when starting a mock server for the test", msPort)
	}
}

// Get the length of the request contents of a `SynchronousMessage`.
size_t pactffi_sync_message_get_request_contents_length(SynchronousMessage *message);
struct PactSyncMessageIterator *pactffi_pact_handle_get_sync_message_iter(PactHandle pact);
struct SynchronousMessage *pactffi_pact_sync_message_iter_next(struct PactSyncMessageIterator *iter);

// Async
// Get the length of the contents of a `Message`.
size_t pactffi_message_get_contents_length(Message *message);

//  Get the contents of a `Message` as a pointer to an array of bytes.
const unsigned char *pactffi_message_get_contents_bin(const Message *message);
struct PactMessageIterator *pactffi_pact_handle_get_message_iter(PactHandle pact);
struct Message *pactffi_pact_message_iter_next(struct PactMessageIterator *iter);

// Need the index of the body to get
const unsigned char *pactffi_sync_message_get_response_contents_bin(const struct SynchronousMessage *message, size_t index);
size_t pactffi_sync_message_get_response_contents_length(const struct SynchronousMessage *message, size_t index);

// Sync
// Get the request contents of a `SynchronousMessage` as a pointer to an array of bytes.
// The number of bytes in the buffer will be returned by `pactffi_sync_message_get_request_contents_length`.
const unsigned char *pactffi_sync_message_get_request_contents_bin(SynchronousMessage *message);
// Set Sync message request body - non binary
void pactffi_sync_message_set_request_contents(InteractionHandle *message, const char *contents, const char *content_type);

// Set Sync message request body - binary
void pactffi_sync_message_set_request_contents_bin(InteractionHandle *message, const unsigned char *contents, size_t len, const char *content_type);

// Set sync message response contents - non binary
void pactffi_sync_message_set_response_contents(InteractionHandle *message, size_t index, const char *contents, const char *content_type);

// Set sync message response contents - binary
void pactffi_sync_message_set_response_contents_bin(InteractionHandle *message, size_t index, const unsigned char *contents, size_t len, const char *content_type);
*/