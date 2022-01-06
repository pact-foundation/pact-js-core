#include <napi.h>
#include <chrono>
#include <thread>
#include "pact.h"
#include <iostream>

int runVerification(const char* args) {
  return pactffi_verify(args);
}

void initPact(const char* level) {
  return pactffi_init_with_log_level(level);
}

using namespace Napi;

class VerificationWorker : public AsyncWorker {
    public:
        VerificationWorker(Function& callback, std::string args)
        : AsyncWorker(callback), args(args) {}

        ~VerificationWorker() {}

    // This code will be executed on the worker thread
    void Execute() override {
      result = runVerification(args.c_str());
    }

    void OnOK() override {
        HandleScope scope(Env());
        Callback().Call({Env().Null(), Number::New(Env(), result)});
    }

    private:
      int result;
      std::string args;

};

// Asynchronous access to the `Estimate()` function
Napi::Value VerifyProvider(const Napi::CallbackInfo& info) {
  // Extract arguments to verifier
  std::string str = info[0].As<Napi::String>().Utf8Value();
  // TODO: error handling

  // Execute the function asynchronously
  Napi::Function callback = info[1].As<Napi::Function>();
  VerificationWorker* verificationWorker = new VerificationWorker(callback, str);
  verificationWorker->Queue();

  return info.Env().Undefined();
}

Napi::Value InitPact(const Napi::CallbackInfo& info) {
  // Extract log level
  std::string logLevel = info[0].As<Napi::String>().Utf8Value();
  // TODO: error handling

  // Initialise Pact
  const char* level = logLevel.c_str();
  initPact(level);

  return info.Env().Undefined();
}