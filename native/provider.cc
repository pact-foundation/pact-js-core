#include <napi.h>
#include <map>
#include "pact-cpp.h"
#include <vector>

using namespace Napi;

// To save passing the struct around. Remove once the rust types are made opaque
std::map<int, VerifierHandle*> handles;

 std::vector<const char*> NapiArrayToCStringVector(Napi::Array arr) {
  std::vector<const char*> cVec;
  for(size_t i = 0; i < arr.Length(); i++) {
      std::string tag = arr.Get(i).As<Napi::String>().Utf8Value();
      char *cstr = strdup(tag.c_str());
      cVec.push_back(cstr);
  }

  return cVec;
}

class VerificationWorker : public AsyncWorker {
    public:
        VerificationWorker(Function& callback, size_t handle)
        : AsyncWorker(callback), handle(handle) {}

        ~VerificationWorker() {}

    // This code will be executed on the worker thread
    void Execute() override {
      VerifierHandle *h = handles[handle];
      result = pactffi_verifier_execute(h);
    }

    void OnOK() override {
        HandleScope scope(Env());
        Callback().Call({Env().Null(), Number::New(Env(), result)});
    }

    private:
      int result;
      int handle;

};

/**
 * Get a Handle to a newly created verifier. You should call `pactffi_verifier_shutdown` when
 * done with the verifier to free all allocated resources
 *
 *
 * Returns a new `VerifierHandle`.
 *
 * C interface:
 *
 *    struct VerifierHandle *pactffi_verifier_new_for_application(const char *name, const char *version);
 *
 */
Napi::Value PactffiVerifierNewForApplication(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env,  "PactffiNewForApplication received < 2 arguments");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiNewForApplication(arg 0) expected a string");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiNewForApplication(arg 1) expected a string");
  }

  // Extract arguments to verifier
  std::string name = info[0].As<Napi::String>().Utf8Value();
  std::string version = info[1].As<Napi::String>().Utf8Value();

  // Store the pointer
  VerifierHandle *handle = pactffi_verifier_new_for_application(name.c_str(), version.c_str());
  handles[handles.size()] = handle;

  return Number::New(env, handles.size() - 1);
}

/**
 * External interface to verifier a provider
 *
 * * `args` - the same as the CLI interface, except newline delimited
 *
 * # Errors
 *
 * Errors are returned as non-zero numeric values.
 *
 * | Error | Description |
 * |-------|-------------|
 * | 1 | The verification process failed, see output for errors |
 * | 2 | A null pointer was received |
 * | 3 | The method panicked |
 * | 4 | Invalid arguments were provided to the verification process |
 *
 * # Safety
 *
 * Exported functions are inherently unsafe. Deal.
 *
 * C interface:
 *
 *    int32_t pactffi_verify(const char *args);
 */
Napi::Value PactffiVerifierExecute(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInit(arguments) received < 1 argument");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiInit(arguments) expected a number");
  }

  // Extract arguments to verifier
  size_t handle = info[0].As<Napi::Number>().Uint32Value();

  // Execute the function asynchronously
  Napi::Function callback = info[1].As<Napi::Function>();
  VerificationWorker* verificationWorker = new VerificationWorker(callback, handle);
  verificationWorker->Queue();

  return info.Env().Undefined();
}


/**
 * Shutdown the verifier and release all resources
 *
 * C interface:
 *
 *    void pactffi_verifier_shutdown(VerifierHandle *handle);
 *
 */
Napi::Value PactffiVerifierShutdown(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiVerifierShutdown received < 1 argument");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiVerifierShutdown(arg 0) expected a VerifierHandle (uint32_t)");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();

  pactffi_verifier_shutdown(handles[handleId]);

  return info.Env().Undefined();
}

/**
 * Set the provider details for the Pact verifier. Passing a NULL for any field will
 * use the default value for that field.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    void pactffi_verifier_set_provider_info(VerifierHandle *handle,
 *                                           const char *name,
 *                                           const char *scheme,
 *                                           const char *host,
 *                                           unsigned short port,
 *                                           const char *path);
 *
 * */
Napi::Value PactffiVerifierSetProviderInfo(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 6) {
    throw Napi::Error::New(env, "PactffiVerifierSetProviderInfo received < 6 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 2 expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 3 expected a string");
  }

  if (!info[4].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 4) expected a number");
  }

  if (!info[5].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 5) expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string name = info[1].As<Napi::String>().Utf8Value();
  std::string scheme = info[2].As<Napi::String>().Utf8Value();
  std::string host = info[3].As<Napi::String>().Utf8Value();
  uint32_t port = info[4].As<Napi::Number>().Uint32Value();
  std::string path = info[5].As<Napi::String>().Utf8Value();

  pactffi_verifier_set_provider_info(handles[handleId], name.c_str(), scheme.c_str(), host.c_str(), port, path.c_str());

  return info.Env().Undefined();
}


/**
 * Adds a new transport for the given provider. Passing a NULL for any field will
 * use the default value for that field.
 *
 * For non-plugin based message interactions, set protocol to "message" and set scheme
 * to an empty string or "https" if secure HTTP is required. Communication to the calling
 * application will be over HTTP to the default provider hostname.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 * 
 *    void pactffi_verifier_add_provider_transport(VerifierHandle *handle,
 *                                           const char *protocol,
 *                                           unsigned short port,
 *                                           const char *path
 *                                           const char *scheme);
 *
 * */
Napi::Value PactffiVerifierAddProviderTransport(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiVerifierAddProviderTransport received < 6 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiVerifierAddProviderTransport(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierAddProviderTransport(arg 1) expected a string");
  }

  if (!info[2].IsNumber()) {
    throw Napi::Error::New(env, "PactffiVerifierAddProviderTransport(arg 2) expected a number");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierAddProviderTransport(arg 3) expected a string");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierAddProviderTransport(arg 4) expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string protocol = info[1].As<Napi::String>().Utf8Value();
  uint32_t port = info[2].As<Napi::Number>().Uint32Value();
  std::string path = info[3].As<Napi::String>().Utf8Value();
  std::string scheme = info[4].As<Napi::String>().Utf8Value();

  pactffi_verifier_add_provider_transport(handles[handleId], protocol.c_str(), port, path.c_str(), scheme.c_str());

  return info.Env().Undefined();
}

/**
 * Enables or disables if no pacts are found to verify results in an error.
 *
 * `is_error` is a boolean value. Set it to greater than zero to enable an error when no pacts
 * are found to verify, and set it to zero to disable this.
 *
 * # Safety
 *
 * This function is safe as long as the handle pointer points to a valid handle.
 *
 * C interface:
 *
 * 
 *    int pactffi_verifier_set_no_pacts_is_error(struct VerifierHandle *handle, unsigned char is_error);
 *
 * */
Napi::Value PactffiVerifierSetNoPactsIsError(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiVerifierSetProviderInfo received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderInfo(arg 1 expected a boolean");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  bool isError = info[1].As<Napi::Boolean>().Value();

  pactffi_verifier_set_no_pacts_is_error(handles[handleId], isError);

  return info.Env().Undefined();
}

/**
 * Set the filters for the Pact verifier.
 *
 * If `filter_description` is not empty, it needs to be as a regular expression.
 *
 * `filter_no_state` is a boolean value. Set it to greater than zero to turn the option on.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    void pactffi_verifier_set_filter_info(VerifierHandle *handle,
 *                                          const char *filter_description,
 *                                          const char *filter_state,
 *                                          unsigned char filter_no_state);
 */
Napi::Value PactffiVerifierSetFilterInfo(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiVerifierSetFilterInfo received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetFilterInfo(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetFilterInfo(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetFilterInfo(arg 2 expected a string");
  }

  if (!info[3].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierSetFilterInfo(arg 3 expected a boolean");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string description = info[1].As<Napi::String>().Utf8Value();
  std::string filterState = info[2].As<Napi::String>().Utf8Value();
  bool filterNoState = info[3].As<Napi::Boolean>().Value();

  pactffi_verifier_set_filter_info(handles[handleId], description.c_str(), filterState.c_str(), filterNoState);

  return info.Env().Undefined();
}

/**
 * Set the provider state for the Pact verifier.
 *
 * `teardown` is a boolean value. Set it to greater than zero to turn the option on.
 * `body` is a boolean value. Set it to greater than zero to turn the option on.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    VerifierHandle *handle, const char *url, unsigned char teardown, unsigned char body);
 */
Napi::Value PactffiVerifierSetProviderState(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 4) {
    throw Napi::Error::New(env, "PactffiVerifierSetProviderState received < 4 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderState(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderState(arg 1) expected a string");
  }

  if (!info[2].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderState(arg 2 expected a boolean");
  }

  if (!info[3].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierSetProviderState(arg 3 expected a boolean");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string url = info[1].As<Napi::String>().Utf8Value();
  bool teardown = info[2].As<Napi::Boolean>().Value();
  bool body = info[3].As<Napi::Boolean>().Value();

  pactffi_verifier_set_provider_state(handles[handleId], url.c_str(), teardown, body);

  return info.Env().Undefined();
}

/**
 * Set the verification options for the Pact verifier.
 *
 * `disable_ssl_verification` is a boolean value. Set it to greater than zero to turn the option on.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    int pactffi_verifier_set_verification_options(VerifierHandle *handle,
 *                                                  unsigned char disable_ssl_verification,
 *                                                  unsigned long request_timeout);
 */
Napi::Value PactffiVerifierSetVerificationOptions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiVerifierSetVerificationOptions received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetVerificationOptions(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierSetVerificationOptions(arg 1) expected a boolean");
  }

  if (!info[2].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetVerificationOptions(arg 2) expected a number");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  bool disableSslVerification = info[1].As<Napi::Boolean>().Value();
  uint32_t requestTimeout = info[2].As<Napi::Number>().Uint32Value();

  pactffi_verifier_set_verification_options(handles[handleId],
                                          disableSslVerification,
                                          requestTimeout);

  return info.Env().Undefined();
}

/**
 * Set the options used when publishing verification results to the Pact Broker
 *
 * # Args
 *
 * - `handle` - The pact verifier handle to update
 * - `provider_version` - Version of the provider to publish
 * - `build_url` - URL to the build which ran the verification
 * - `provider_tags` - Collection of tags for the provider
 * - `provider_tags_len` - Number of provider tags supplied
 * - `provider_branch` - Name of the branch used for verification
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    int pactffi_verifier_set_publish_options(VerifierHandle *handle,
 *                                             const char *provider_version,
 *                                             const char *build_url,
 *                                             const char *const *provider_tags,
 *                                             unsigned short provider_tags_len,
 *                                             const char *provider_branch);
 */
Napi::Value PactffiVerifierSetPublishOptions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiVerifierSetPublishOptions received < 5 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetPublishOptions(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetPublishOptions(arg 1 expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetPublishOptions(arg 2 expected a string");
  }

  if (!info[3].IsArray()) {
    throw Napi::Error::New(env, "pactffiVerifierSetPublishOptions(arg 3) expected an array of strings");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierSetPublishOptions(arg 3 expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string providerVersion = info[1].As<Napi::String>().Utf8Value();
  std::string buildUrl = info[2].As<Napi::String>().Utf8Value();
  Napi::Array providerTagsRaw = info[3].As<Napi::Array>();
  std::string providerVersionBranch = info[4].As<Napi::String>().Utf8Value();

  pactffi_verifier_set_publish_options(handles[handleId],
                                          providerVersion.c_str(),
                                          buildUrl.c_str(),
                                          &NapiArrayToCStringVector(providerTagsRaw)[0],
                                          providerTagsRaw.Length(),
                                          providerVersionBranch.c_str());

  return info.Env().Undefined();
}

/**
 * Set the consumer filters for the Pact verifier.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *     void pactffi_verifier_set_consumer_filters(VerifierHandle *handle,
 *                                                const char *const *consumer_filters,
 *                                                unsigned short consumer_filters_len);
 *
 */
Napi::Value PactffiVerifierSetConsumerFilters(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiVerifierSetConsumerFilters received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetConsumerFilters(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsArray()) {
    throw Napi::Error::New(env, "pactffiVerifierSetConsumerFilters(arg 1) expected an array of strings");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  Napi::Array consumerFilters = info[1].As<Napi::Array>();

  pactffi_verifier_set_consumer_filters(handles[handleId],
                                        &NapiArrayToCStringVector(consumerFilters)[0],
                                        consumerFilters.Length());

  return info.Env().Undefined();
}


/**
 * Set the provider to fail or pass if no pacts can be found.
 *
 * C interface:
 *
 *     void pactffi_verifier_set_no_pacts_is_error(VerifierHandle *handle,
 *                                                 unsigned char is_error);
 *
 */
Napi::Value PactffiVerifierSetFailIfNoPactsFound(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiVerifierSetFailIfNoPactsFound received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierSetFailIfNoPactsFound(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierSetFailIfNoPactsFound(arg 1) expected a boolean");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  bool failIfNoPactsFound = info[1].As<Napi::Boolean>().Value();

  pactffi_verifier_set_no_pacts_is_error(handles[handleId], failIfNoPactsFound);

  return info.Env().Undefined();
}


/**
 * Adds a custom header to be added to the requests made to the provider.
 *
 * # Safety
 *
 * The header name and value must point to a valid NULL terminated string and must contain
 * valid UTF-8.
 *
 * C interface:
 *
 *    void pactffi_verifier_add_custom_header(VerifierHandle *handle,
 *                                            const char *header_name,
 *                                            const char *header_value);
 *
 */
Napi::Value PactffiVerifierAddCustomHeader(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiVerifierAddCustomHeader received < 3 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "PactffiVerifierAddCustomHeader(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierAddCustomHeader(arg 1 expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "PactffiVerifierAddCustomHeader(arg 2 expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string name = info[1].As<Napi::String>().Utf8Value();
  std::string value = info[2].As<Napi::String>().Utf8Value();

  pactffi_verifier_add_custom_header(handles[handleId],
                                        name.c_str(),
                                        value.c_str());

  return info.Env().Undefined();
}

/**
 * Adds a Pact file as a source to verify.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    void pactffi_verifier_add_file_source(VerifierHandle *handle, const char *file);
 */
Napi::Value PactffiVerifierAddFileSource(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiVerifierAddFileSource received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierAddFileSource(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierAddFileSource(arg 1) expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string file = info[1].As<Napi::String>().Utf8Value();

  pactffi_verifier_add_file_source(handles[handleId], file.c_str());

  return info.Env().Undefined();
}

/**
 * Adds a Pact directory as a source to verify. All pacts from the directory that match the
 * provider name will be verified.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    void pactffi_verifier_add_directory_source(VerifierHandle *handle, const char *directory);
 */
Napi::Value PactffiVerifierAddDirectorySource(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiVerifierAddDirectorySource received < 2 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierAddDirectorySource(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierAddDirectorySource(arg 1) expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string dir = info[1].As<Napi::String>().Utf8Value();

  pactffi_verifier_add_directory_source(handles[handleId], dir.c_str());

  return info.Env().Undefined();
}

/**
 * Adds a URL as a source to verify. The Pact file will be fetched from the URL.
 *
 * If a username and password is given, then basic authentication will be used when fetching
 * the pact file. If a token is provided, then bearer token authentication will be used.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    void pactffi_verifier_url_source(VerifierHandle *handle,
 *                                     const char *url,
 *                                     const char *username,
 *                                     const char *password,
 *                                     const char *token);
 */
Napi::Value PactffiVerifierUrlSource(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 5) {
    throw Napi::Error::New(env, "PactffiVerifierUrlSource received < 5 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierUrlSource(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierUrlSource(arg 1) expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierUrlSource(arg 2) expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierUrlSource(arg 3) expected a string");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierUrlSource(arg 4) expected a string");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string url = info[1].As<Napi::String>().Utf8Value();
  std::string username = info[2].As<Napi::String>().Utf8Value();
  std::string password = info[3].As<Napi::String>().Utf8Value();
  std::string token = info[4].As<Napi::String>().Utf8Value();

  pactffi_verifier_url_source(handles[handleId], url.c_str(), username.c_str(), password.c_str(), token.c_str());

  return info.Env().Undefined();
}

// Deprecated
// /**
//  * Adds a Pact broker as a source to verify. This will fetch all the pact files from the broker
//  * that match the provider name.
//  *
//  * If a username and password is given, then basic authentication will be used when fetching
//  * the pact file. If a token is provided, then bearer token authentication will be used.
//  *
//  * # Safety
//  *
//  * All string fields must contain valid UTF-8. Invalid UTF-8
//  * will be replaced with U+FFFD REPLACEMENT CHARACTER.
//  *
//  * C interface:
//  *
//  *    void pactffi_verifier_broker_source(VerifierHandle *handle,
//  *                                        const char *url,
//  *                                        const char *provider_name,
//  *                                        const char *username,
//  *                                        const char *password,
//  *                                        const char *token);
//  */
// Napi::Value PactffiVerifierBrokerSource(const Napi::CallbackInfo& info) {
//   Napi::Env env = info.Env();
//   if (info.Length() < 5) {
//     throw Napi::Error::New(env, "PactffiVerifierUrlSource received < 5 arguments");
//   }

//   if (!info[0].IsNumber()) {
//     throw Napi::Error::New(env, "PactffiVerifierUrlSource(arg 0) expected a VerifierHandle");
//   }

//   if (!info[1].IsString()) {
//     throw Napi::Error::New(env, "PactffiVerifierUrlSource(arg 1) expected a string");
//   }

//   if (!info[2].IsString()) {
//     throw Napi::Error::New(env, "PactffiVerifierUrlSource(arg 2) expected a string");
//   }

//   if (!info[3].IsString()) {
//     throw Napi::Error::New(env, "PactffiVerifierUrlSource(arg 3) expected a string");
//   }

//   if (!info[4].IsString()) {
//     throw Napi::Error::New(env, "PactffiVerifierUrlSource(arg 4) expected a string");
//   }

//   uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
//   std::string url = info[1].As<Napi::String>().Utf8Value();
//   std::string username = info[2].As<Napi::String>().Utf8Value();
//   std::string password = info[3].As<Napi::String>().Utf8Value();
//   std::string token = info[4].As<Napi::String>().Utf8Value();

//   pactffi_verifier_broker_source(handles[handleId], url.c_str(), username.c_str(), password.c_str(), token.c_str());

//   return info.Env().Undefined();
// }

/**
 * Adds a Pact broker as a source to verify. This will fetch all the pact files from the broker
 * that match the provider name and the consumer version selectors
 * (See `https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors/`).
 *
 * The consumer version selectors must be passed in in JSON format.
 *
 * `enable_pending` is a boolean value. Set it to greater than zero to turn the option on.
 *
 * If the `include_wip_pacts_since` option is provided, it needs to be a date formatted in
 * ISO format (YYYY-MM-DD).
 *
 * If a username and password is given, then basic authentication will be used when fetching
 * the pact file. If a token is provided, then bearer token authentication will be used.
 *
 * # Safety
 *
 * All string fields must contain valid UTF-8. Invalid UTF-8
 * will be replaced with U+FFFD REPLACEMENT CHARACTER.
 *
 * C interface:
 *
 *    void pactffi_verifier_broker_source_with_selectors(VerifierHandle *handle,
 *                                                       const char *url,
 *                                                       const char *provider_name,
 *                                                       const char *username,
 *                                                       const char *password,
 *                                                       const char *token,
 *                                                       unsigned char enable_pending,
 *                                                       const char *include_wip_pacts_since,
 *                                                       const char *const *provider_tags,
 *                                                       unsigned short provider_tags_len,
 *                                                       const char *provider_branch,
 *                                                       const char *const *consumer_version_selectors,
 *                                                       unsigned short consumer_version_selectors_len,
 *                                                       const char *const *consumer_version_tags,
 *                                                       unsigned short consumer_version_tags_len);
 */
Napi::Value PactffiVerifierBrokerSourceWithSelectors(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 11) {
    throw Napi::Error::New(env, "PactffiVerifierBrokerSourceWithSelectors received < 11 arguments");
  }

  if (!info[0].IsNumber()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 0) expected a VerifierHandle");
  }

  if (!info[1].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 1 expected a string");
  }

  if (!info[2].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 2 expected a string");
  }

  if (!info[3].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 3 expected a string");
  }

  if (!info[4].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 4 expected a string");
  }

  if (!info[5].IsBoolean()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 5) expected a boolean");
  }

  if (!info[6].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 6 expected a string");
  }

  if (!info[7].IsArray()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 7) expected an array of strings");
  }

  if (!info[8].IsString()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 8 expected a string");
  }

  if (!info[9].IsArray()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 9) expected an array of strings");
  }

  if (!info[10].IsArray()) {
    throw Napi::Error::New(env, "pactffiVerifierBrokerSourceWithSelectors(arg 10) expected an array of strings");
  }

  uint32_t handleId = info[0].As<Napi::Number>().Uint32Value();
  std::string url = info[1].As<Napi::String>().Utf8Value();
  std::string username = info[2].As<Napi::String>().Utf8Value();
  std::string password = info[3].As<Napi::String>().Utf8Value();
  std::string token = info[4].As<Napi::String>().Utf8Value();
  bool enablePending = info[5].As<Napi::Boolean>().Value();
  std::string includeWipPactsSince = info[6].As<Napi::String>().Utf8Value();
  Napi::Array providerTags = info[7].As<Napi::Array>();
  std::string providerVersionBranch = info[8].As<Napi::String>().Utf8Value();
  Napi::Array consumerVersionSelectors = info[9].As<Napi::Array>();
  Napi::Array consumerVersionTags = info[10].As<Napi::Array>();

  auto cProviderTags = NapiArrayToCStringVector(providerTags);
  auto cConsumerVersionSelectors = NapiArrayToCStringVector(consumerVersionSelectors);
  auto cConsumerVersionTags = NapiArrayToCStringVector(consumerVersionTags);

  pactffi_verifier_broker_source_with_selectors(handles[handleId],
                                              url.c_str(),
                                              username.c_str(),
                                              password.c_str(),
                                              token.c_str(),
                                              enablePending,
                                              includeWipPactsSince.c_str(),
                                              &cProviderTags[0],
                                              providerTags.Length(),
                                              providerVersionBranch.c_str(),
                                              &cConsumerVersionSelectors[0],
                                              consumerVersionSelectors.Length(),
                                              &cConsumerVersionTags[0],
                                              consumerVersionTags.Length());

  return info.Env().Undefined();
}
