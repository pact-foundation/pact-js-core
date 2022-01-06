#include <stdio.h>
#include <node_api.h>
#include <pact.h>

// libpact_init
void LibpactInit(napi_env env, napi_callback_info info) {
  pactffi_init("LOG_LEVEL");
  pactffi_init_with_log_level("INFO");
}

// libpact_version
napi_value LibpactVersion(napi_env env, napi_callback_info info) {
  napi_value version;
  napi_status status;

  const char* version_str = pactffi_version();

  status = napi_create_string_utf8(env, version_str, NAPI_AUTO_LENGTH, &version);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to read version from core");
  }

  return version;
}

// libpact_new_pact
napi_value LibpactNewPact(napi_env env, napi_callback_info info) {
  napi_value pact;
  napi_status status;

  // actually a uint16
  PactHandle handle = pactffi_new_pact("consumer", "provider");

  status = napi_create_uint32(env, handle, &pact);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create a new pact");
  }

  return pact;
}

// libpact_new_interaction
napi_value LibpactNewInteraction(napi_env env, napi_callback_info info) {
  napi_status status;
  napi_value interaction;

  size_t argc = 1;
  PactHandle pact_handle = 0;
  napi_value argv[1];
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }

  status = napi_get_value_uint32(env, argv[0], &pact_handle);
  printf("Received pact handle: %d\n", pact_handle);

  // actually a uint16
  InteractionHandle handle = pactffi_new_interaction(pact_handle, "empty description");

  status = napi_create_uint32(env, handle, &interaction);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create a new pact");
  }

  return interaction;
}

// libpact_upon_receiving
napi_value LibpactUponReceiving(napi_env env, napi_callback_info info) {
  napi_status status;
  napi_value res;

  size_t argc = 1;
  InteractionHandle interaction_handle = 0;
  napi_value argv[1];
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }

  status = napi_get_value_uint32(env, argv[0], &interaction_handle);
  printf("Received interaction handle: %d\n", interaction_handle);

  // actually a uint32
  int success = pactffi_upon_receiving(interaction_handle, "new description");

  status = napi_get_boolean(env, success, &res);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to set upon receiving");
  }

  return res;
}

// libpact_verify
napi_value LibpactVerifyProvider(napi_env env, napi_callback_info info) {
  napi_status status;
  napi_value response;
  napi_value argv[1];

  size_t argc = 1;
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }

  char *args;
  size_t str_size;

  // First determine the string size: https://nodejs.org/api/n-api.html#napi_get_value_string_utf8
  napi_get_value_string_utf8(env, argv[0], NULL, 0, &str_size);
  str_size += 1;

  args = (char*)calloc(str_size + 1, sizeof(char));
  size_t str_size_read;

  // Get the actual string now the size is known
  status = napi_get_value_string_utf8(env, argv[0], args, str_size, &str_size_read);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to read the verification arguments");
  }

  int res = pactffi_verify(args);

  status = napi_create_uint32(env, res, &response);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to verify pact");
  }

  return response;
}


napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;

  // version
  status = napi_create_function(env, NULL, 0, LibpactVersion, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function: version");
  }

  status = napi_set_named_property(env, exports, "version", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports for: version");
  }

  // init
  status = napi_create_function(env, NULL, 0, LibpactInit, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function: init");
  }

  status = napi_set_named_property(env, exports, "init", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports for: init");
  }

  // new pact
  status = napi_create_function(env, NULL, 0, LibpactNewPact, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function: new_pact");
  }

  status = napi_set_named_property(env, exports, "new_pact", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports for: new_pact");
  }

  // new interaction
  status = napi_create_function(env, NULL, 0, LibpactNewInteraction, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function: new_interaction");
  }

  status = napi_set_named_property(env, exports, "new_interaction", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports for: new_interaction");
  }

  // upon receiving
  status = napi_create_function(env, NULL, 0, LibpactUponReceiving, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function: upon_receiving");
  }

  status = napi_set_named_property(env, exports, "upon_receiving", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports for: upon_receiving");
  }

  // verify (provider)
  status = napi_create_function(env, NULL, 0, LibpactVerifyProvider, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function: verify_provider");
  }

  status = napi_set_named_property(env, exports, "verify_provider", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports for: verify_provider");
  }

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)