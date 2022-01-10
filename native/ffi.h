#include <napi.h>

Napi::Value PactffiVersion(const Napi::CallbackInfo& info);
Napi::Value PactffiInit(const Napi::CallbackInfo& info);
Napi::Value PactffiInitWithLogLevel(const Napi::CallbackInfo& info);

// Unimplemented
Napi::Value PactffiCheckRegex(const Napi::CallbackInfo& info);
Napi::Value PactffiFetchLogBuffer(const Napi::CallbackInfo& info);
Napi::Value PactffiFreeString(const Napi::CallbackInfo& info);
Napi::Value PactffiLogMessage(const Napi::CallbackInfo& info);
Napi::Value PactffiLogToBuffer(const Napi::CallbackInfo& info);
Napi::Value PactffiLogToFile(const Napi::CallbackInfo& info);
Napi::Value PactffiLogToStderr(const Napi::CallbackInfo& info);
Napi::Value PactffiLogToStdout(const Napi::CallbackInfo& info);
Napi::Value PactffiLoggerApply(const Napi::CallbackInfo& info);
Napi::Value PactffiLoggerAttachSink(const Napi::CallbackInfo& info);
Napi::Value PactffiLoggerInit(const Napi::CallbackInfo& info);
