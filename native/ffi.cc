#include <napi.h>
#include "pact.h"

using namespace Napi;

Napi::Value PactffiVersion(const Napi::CallbackInfo& info) {
  const char* version = pactffi_version();

  return Napi::String::New(info.Env(), version);
}

Napi::Value PactffiInit(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInit(envVar) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(envVar) expected a string");
  }

  // Extract log level environment variable
  std::string envVar = info[0].As<Napi::String>().Utf8Value();

  // Initialise Pact
  pactffi_init_with_log_level(envVar.c_str());

  return env.Undefined();
}

Napi::Value PactffiInitWithLogLevel(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInitWithLogLevel(logLevel) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInitWithLogLevel(logLevel) expected a string");
  }

  // Extract log level
  std::string logLevel = info[0].As<Napi::String>().Utf8Value();

  // Initialise Pact
  pactffi_init_with_log_level(logLevel.c_str());

  return env.Undefined();
}