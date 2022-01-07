#include <napi.h>
#include "provider.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "pactffiInitWithLogLevel"),
              Napi::Function::New(env, PactffiInitWithLogLevel));

  // Consumer

  // Provider
  exports.Set(Napi::String::New(env, "pactffiVerify"),
              Napi::Function::New(env, PactffiVerify));

  return exports;
}

NODE_API_MODULE(pact, Init)