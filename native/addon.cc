#include <napi.h>
#include "ffi.h"
#include "consumer.h"
#include "provider.h"
#include "plugin.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "pactffiVersion"),
              Napi::Function::New(env, PactffiVersion));
  exports.Set(Napi::String::New(env, "pactffiInit"),
              Napi::Function::New(env, PactffiInit));
  exports.Set(Napi::String::New(env, "pactffiInitWithLogLevel"),
              Napi::Function::New(env, PactffiInitWithLogLevel));

  // Consumer

  // Provider
  exports.Set(Napi::String::New(env, "pactffiVerify"),
              Napi::Function::New(env, PactffiVerify));

  return exports;
}

NODE_API_MODULE(pact, Init)