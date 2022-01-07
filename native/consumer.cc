#include <napi.h>
#include "pact.h"

using namespace Napi;

// Napi::Value PactffiVerify(const Napi::CallbackInfo& info) {
//   Napi::Env env = info.Env();
//   if (info.Length() < 1) {
//     throw Napi::Error::New(env,  "PactffiInit(arguments) received < 1 argument");
//   }

//   if (!info[0].IsString()) {
//     throw Napi::Error::New(env, "PactffiInit(arguments) expected a string");
//   }

//   // Extract arguments to verifier
//   std::string str = info[0].As<Napi::String>().Utf8Value();

//   // Execute the function asynchronously
//   Napi::Function callback = info[1].As<Napi::Function>();
//   VerificationWorker* verificationWorker = new VerificationWorker(callback, str);
//   verificationWorker->Queue();

//   return info.Env().Undefined();
// }

// Napi::Value PactffiInitWithLogLevel(const Napi::CallbackInfo& info) {
//   Napi::Env env = info.Env();

//   if (info.Length() < 1) {
//     throw Napi::Error::New(env, "init(logLevel) received < 1 argument");
//   }

//   if (!info[0].IsString()) {
//     throw Napi::Error::New(env, "init(logLevel) expected a string");
//   }

//   // Extract log level
//   std::string logLevel = info[0].As<Napi::String>().Utf8Value();

//   // Initialise Pact
//   const char* level = logLevel.c_str();
//   pactffi_init_with_log_level(level);

//   return env.Undefined();
// }