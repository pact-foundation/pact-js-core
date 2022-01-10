#include <napi.h>
#include "pact.h"

using namespace Napi;

class VerificationWorker : public AsyncWorker {
    public:
        VerificationWorker(Function& callback, std::string args)
        : AsyncWorker(callback), args(args) {}

        ~VerificationWorker() {}

    // This code will be executed on the worker thread
    void Execute() override {
      result = pactffi_verify(args.c_str());
    }

    void OnOK() override {
        HandleScope scope(Env());
        Callback().Call({Env().Null(), Number::New(Env(), result)});
    }

    private:
      int result;
      std::string args;

};

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
Napi::Value PactffiVerify(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1) {
    throw Napi::Error::New(env,  "PactffiInit(arguments) received < 1 argument");
  }

  if (!info[0].IsString()) {
    throw Napi::Error::New(env, "PactffiInit(arguments) expected a string");
  }

  // Extract arguments to verifier
  std::string str = info[0].As<Napi::String>().Utf8Value();

  // Execute the function asynchronously
  Napi::Function callback = info[1].As<Napi::Function>();
  VerificationWorker* verificationWorker = new VerificationWorker(callback, str);
  verificationWorker->Queue();

  return info.Env().Undefined();
}