#include <napi.h>
#include "pact-cpp.h"

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

LevelFilter integerToLevelFilter(Napi::Env &env, uint32_t number) {
  LevelFilter level = LevelFilter::LevelFilter_Off;

  switch(number) {
    case 0:
      level = LevelFilter::LevelFilter_Off;
      break;
    case 1:
      level = LevelFilter::LevelFilter_Error;
      break;
    case 2:
      level = LevelFilter::LevelFilter_Warn;
      break;
    case 3:
      level = LevelFilter::LevelFilter_Info;
      break;
    case 4:
      level = LevelFilter::LevelFilter_Debug;
      break;
    case 5:
      level = LevelFilter::LevelFilter_Trace;
      break;
    default:
      std::string err =  "Unable to parse Level Filter: ";
      err += number;

      throw Napi::Error::New(env, err);
  }

  return level;
}


Napi::Value PactffiLogToFile(const Napi::CallbackInfo& info) {
   // return: int
   Napi::Env env = info.Env();

  if (info.Length() < 2) {
    throw Napi::Error::New(env, "PactffiLogToFile(envVar) received < 2 arguments");
  }

    if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiLogToFile(envVar) expected a string");
  }

  if (!info[1].IsNumber()) {
    throw Napi::Error::New(env, "PactffiLogToFile(envVar) expected a number");
  }

  // Extract log level
  std::string fileName = info[0].As<Napi::String>().Utf8Value();
  uint32_t levelFilterNumber = info[1].As<Napi::Number>().Uint32Value();
  LevelFilter levelFilter = integerToLevelFilter(env, levelFilterNumber);

  int res = pactffi_log_to_file(fileName.c_str(), levelFilter);

  return Napi::Number::New(env, res);
}
/*

Napi::Value Pactffi_log_message(const Napi::CallbackInfo& info) {
   // return: void
   Napi::Env env = info.Env();

  if (info.Length() < 3) {
    throw Napi::Error::New(env, "PactffiInit(envVar) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(envVar) expected a string");
  }

  // pactffi_log_message(const char *source, const char *log_level, const char *message);

  pactffi_log_message(const char *source, const char *log_level, const char *message);

  return info.Env().Undefined();
}

Napi::Value Pactffi_log_to_stdout(const Napi::CallbackInfo& info) {
   // return: int
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInit(envVar) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(envVar) expected a string");
  }

  // pactffi_log_to_stdout(LevelFilter level_filter);

  pactffi_log_to_stdout(LevelFilter level_filter);

  return info.Env().Undefined();
}

Napi::Value Pactffi_log_to_stderr(const Napi::CallbackInfo& info) {
   // return: int
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInit(envVar) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(envVar) expected a string");
  }

  // pactffi_log_to_stderr(LevelFilter level_filter);

  pactffi_log_to_stderr(LevelFilter level_filter);

  return info.Env().Undefined();
}

Napi::Value Pactffi_log_to_file(const Napi::CallbackInfo& info) {
   // return: int
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInit(envVar) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(envVar) expected a string");
  }

  // pactffi_log_to_file(const char *file_name, LevelFilter level_filter);

  pactffi_log_to_file(const char *file_name, LevelFilter level_filter);

  return info.Env().Undefined();
}

Napi::Value Pactffi_log_to_buffer(const Napi::CallbackInfo& info) {
   // return: int
   Napi::Env env = info.Env();

  if (info.Length() < 1) {
    throw Napi::Error::New(env, "PactffiInit(envVar) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(envVar) expected a string");
  }

  // pactffi_log_to_buffer(LevelFilter level_filter);

  pactffi_log_to_buffer(LevelFilter level_filter);

  return info.Env().Undefined();
}
*/