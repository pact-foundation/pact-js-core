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
   // return: const
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
   // return: void
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
   // return: bool
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
   // return: bool
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
   // return: int32_t
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
 * External interface to cleanup a mock server. This function will try terminate the mock server
 * with the given port number and cleanup any memory allocated for it. Returns true, unless a
 * mock server with the given port number does not exist, or the function panics.
 *
 * C interface:
 *
 *    bool pactffi_cleanup_mock_server(int32_t mock_server_port);
 */
Napi::Value PactffiCleanupMockServer(const Napi::CallbackInfo& info) {
   // return: bool
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
 * C interface:
 *
 *    int32_t pactffi_write_pact_file(int32_t mock_server_port, const char *directory, bool overwrite);
 */
Napi::Value PactffiWritePactFile(const Napi::CallbackInfo& info) {
   // return: int32_t
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiWritePactFile received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiWritePactFile(arg 0) expected a number");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiWritePactFile(arg 1) expected a string");
  }

  if (!info[2].IsBoolean()) {
    throw Napi::Error::New(env, "PactffiWritePactFile(arg 2) expected a boolean");
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
   // return: PactHandle
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
   // return: InteractionHandle
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
   // return: bool
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
   // return: bool
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
   // return: bool
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
    throw Napi::Error::New(env, "PactffiGivenWithParam(arg 2) expected a string");
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
   // return: bool
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
   // return: bool
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
   // return: bool
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
   // return: bool
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
 * C interface:
 *
 *    bool pactffi_with_header(InteractionHandle interaction,
 *                        InteractionPart part,
 *                        const char *name,
 *                        size_t index,
 *                        const char *value);
 */
Napi::Value PactffiWithHeader(const Napi::CallbackInfo& info) {
   // return: bool
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

  bool res = pactffi_with_header(interaction, part, name.c_str(), index, value.c_str());

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
   // return: bool
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
   // return: bool
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

  // uint32_t part = info[1].As<Napi::Number>().Uint32Value();
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
   // return: bool
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
   // return: bool
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

/*

Napi::Value PactffiMessageExpectsToReceive(const Napi::CallbackInfo& info) {
   // return: void
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMessageExpectsToReceive received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageExpectsToReceive(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_message_expects_to_receive(MessageHandle message, const char *description);

  return info.Env().Undefined();
}

Napi::Value PactffiMessageGiven(const Napi::CallbackInfo& info) {
   // return: void
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMessageGiven received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageGiven(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_message_given(MessageHandle message, const char *description);

  return info.Env().Undefined();
}

Napi::Value PactffiMessageReify(const Napi::CallbackInfo& info) {
   // return: const
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMessageReify received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiMessageReify(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_message_reify(MessageHandle message_handle);

  return info.Env().Undefined();
}

Napi::Value PactffiVerifierLogs(const Napi::CallbackInfo& info) {
   // return: const
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiVerifierLogs received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierLogs(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_verifier_logs(const VerifierHandle *handle);

  return info.Env().Undefined();
}

Napi::Value PactffiVerifierLogsForProvider(const Napi::CallbackInfo& info) {
   // return: const
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiVerifierLogsForProvider received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierLogsForProvider(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_verifier_logs_for_provider(const char *provider_name);

  return info.Env().Undefined();
}

Napi::Value PactffiMockServerLogs(const Napi::CallbackInfo& info) {
   // return: const
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiMockServerLogs received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiMockServerLogs(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_mock_server_logs(int32_t mock_server_port);

  return info.Env().Undefined();
}

Napi::Value PactffiNewMessageInteraction(const Napi::CallbackInfo& info) {
   // return: InteractionHandle
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiNewMessageInteraction received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiNewMessageInteraction(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_new_message_interaction(PactHandle pact, const char *description);

  return info.Env().Undefined();
}

Napi::Value PactffiNewSyncMessageInteraction(const Napi::CallbackInfo& info) {
   // return: InteractionHandle
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiNewSyncMessageInteraction received < 1 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiNewSyncMessageInteraction(arg 0) expected a string");
  }

  std::string arg0 = info[0].As<Napi::String>().Utf8Value();

  pactffi_new_sync_message_interaction(PactHandle pact, const char *description);

  return info.Env().Undefined();
}

*/