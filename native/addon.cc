#include <napi.h>
#include "provider.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "verifyProvider"),
              Napi::Function::New(env, VerifyProvider));
  exports.Set(Napi::String::New(env, "init"),
              Napi::Function::New(env, InitPact));

  return exports;
}

NODE_API_MODULE(pact, Init)