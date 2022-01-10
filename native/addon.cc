#include <napi.h>
#include "ffi.h"
#include "consumer.h"
#include "provider.h"
#include "plugin.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "pactffiVersion"), Napi::Function::New(env, PactffiVersion));
  exports.Set(Napi::String::New(env, "pactffiInit"), Napi::Function::New(env, PactffiInit));
  exports.Set(Napi::String::New(env, "pactffiInitWithLogLevel"), Napi::Function::New(env, PactffiInitWithLogLevel));

  // Consumer
  exports.Set(Napi::String::New(env, "pactffiMockServerMatched"), Napi::Function::New(env, PactffiMockServerMatched));
  exports.Set(Napi::String::New(env, "pactffiMockServerMismatches"), Napi::Function::New(env, PactffiMockServerMismatches));
  exports.Set(Napi::String::New(env, "pactffiCreateMockServerForPact"), Napi::Function::New(env, PactffiCreateMockServerForPact));
  exports.Set(Napi::String::New(env, "pactffiCleanupMockServer"), Napi::Function::New(env, PactffiCleanupMockServer));
  exports.Set(Napi::String::New(env, "pactffiWritePactFile"), Napi::Function::New(env, PactffiWritePactFile));
  exports.Set(Napi::String::New(env, "pactffiNewPact"), Napi::Function::New(env, PactffiNewPact));
  exports.Set(Napi::String::New(env, "pactffiNewInteraction"), Napi::Function::New(env, PactffiNewInteraction));
  exports.Set(Napi::String::New(env, "pactffiUponReceiving"), Napi::Function::New(env, PactffiUponReceiving));
  exports.Set(Napi::String::New(env, "pactffiGiven"), Napi::Function::New(env, PactffiGiven));
  exports.Set(Napi::String::New(env, "pactffiGivenWithParam"), Napi::Function::New(env, PactffiGivenWithParam));
  exports.Set(Napi::String::New(env, "pactffiWithRequest"), Napi::Function::New(env, PactffiWithRequest));
  exports.Set(Napi::String::New(env, "pactffiWithQueryParameter"), Napi::Function::New(env, PactffiWithQueryParameter));
  exports.Set(Napi::String::New(env, "pactffiWithSpecification"), Napi::Function::New(env, PactffiWithSpecification));
  exports.Set(Napi::String::New(env, "pactffiWithPactMetadata"), Napi::Function::New(env, PactffiWithPactMetadata));
  exports.Set(Napi::String::New(env, "pactffiWithHeader"), Napi::Function::New(env, PactffiWithHeader));
  exports.Set(Napi::String::New(env, "pactffiWithBody"), Napi::Function::New(env, PactffiWithBody));
  exports.Set(Napi::String::New(env, "pactffiWithBinaryFile"), Napi::Function::New(env, PactffiWithBinaryFile));
  exports.Set(Napi::String::New(env, "pactffiWithMultipartFile"), Napi::Function::New(env, PactffiWithMultipartFile));
  exports.Set(Napi::String::New(env, "pactffiResponseStatus"), Napi::Function::New(env, PactffiResponseStatus));

  // Provider
  exports.Set(Napi::String::New(env, "pactffiVerify"), Napi::Function::New(env, PactffiVerify));

  return exports;
}

NODE_API_MODULE(pact, Init)