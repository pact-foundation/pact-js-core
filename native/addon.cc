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
  exports.Set(Napi::String::New(env, "pactFfiUsingPlugin"), Napi::Function::New(env, PactFfiUsingPlugin));
  exports.Set(Napi::String::New(env, "pactFfiCleanupPlugins"), Napi::Function::New(env, PactFfiCleanupPlugins));
  exports.Set(Napi::String::New(env, "pactFfiPluginInteractionContents"), Napi::Function::New(env, PactFfiPluginInteractionContents));



  exports.set(Napi::String::New(env, "pactffiNewMessage"), Napi::Function::New(env, PactffiNewMessage));
  exports.set(Napi::String::New(env, "pactffiNewMessageInteraction"), Napi::Function::New(env, PactffiNewMessageInteraction));
  exports.set(Napi::String::New(env, "pactffiNewMessagePact"), Napi::Function::New(env, PactffiNewMessagePact));
  exports.set(Napi::String::New(env, "pactffiMessageReify"), Napi::Function::New(env, PactffiMessageReify));
  exports.set(Napi::String::New(env, "pactffiMessageGiven"), Napi::Function::New(env, PactffiMessageGiven));
  exports.set(Napi::String::New(env, "pactffiMessageGivenWithParam"), Napi::Function::New(env, PactffiMessageGivenWithParam));
  exports.set(Napi::String::New(env, "pactffiMessageSetDescription"), Napi::Function::New(env, PactffiMessageSetDescription));
  exports.set(Napi::String::New(env, "pactffiMessageWithContents"), Napi::Function::New(env, PactffiMessageWithContents));
  exports.set(Napi::String::New(env, "pactffiMessageWithMetadata"), Napi::Function::New(env, PactffiMessageWithMetadata));

  // Provider
  exports.Set(Napi::String::New(env, "pactffiVerifierNewForApplication"), Napi::Function::New(env, PactffiVerifierNewForApplication));
  exports.Set(Napi::String::New(env, "pactffiVerifierSetVerificationOptions"), Napi::Function::New(env, PactffiVerifierSetVerificationOptions));
  exports.Set(Napi::String::New(env, "pactffiVerifierSetPublishOptions"), Napi::Function::New(env, PactffiVerifierSetPublishOptions));
  exports.Set(Napi::String::New(env, "pactffiVerifierExecute"), Napi::Function::New(env, PactffiVerifierExecute));
  exports.Set(Napi::String::New(env, "pactffiVerifierShutdown"), Napi::Function::New(env, PactffiVerifierShutdown));
  exports.Set(Napi::String::New(env, "pactffiVerifierSetProviderInfo"), Napi::Function::New(env, PactffiVerifierSetProviderInfo));
  exports.Set(Napi::String::New(env, "pactffiVerifierSetFilterInfo"), Napi::Function::New(env, PactffiVerifierSetFilterInfo));
  exports.Set(Napi::String::New(env, "pactffiVerifierSetProviderState"), Napi::Function::New(env, PactffiVerifierSetProviderState));
  exports.Set(Napi::String::New(env, "pactffiVerifierSetConsumerFilters"), Napi::Function::New(env, PactffiVerifierSetConsumerFilters));
  exports.Set(Napi::String::New(env, "pactffiVerifierAddCustomHeader"), Napi::Function::New(env, PactffiVerifierAddCustomHeader));
  exports.Set(Napi::String::New(env, "pactffiVerifierAddFileSource"), Napi::Function::New(env, PactffiVerifierAddFileSource));
  exports.Set(Napi::String::New(env, "pactffiVerifierAddDirectorySource"), Napi::Function::New(env, PactffiVerifierAddDirectorySource));
  exports.Set(Napi::String::New(env, "pactffiVerifierUrlSource"), Napi::Function::New(env, PactffiVerifierUrlSource));
  exports.Set(Napi::String::New(env, "pactffiVerifierBrokerSourceWithSelectors"), Napi::Function::New(env, PactffiVerifierBrokerSourceWithSelectors));

  return exports;
}

NODE_API_MODULE(pact, Init)