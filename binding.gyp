{
  "targets": [
    {
      "target_name": "pact",
      "sources": [
        "native/addon.cc",
        "native/ffi.cc",
        "native/consumer.cc",
        "native/provider.cc",
        "native/plugin.cc"
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")",
        "<(module_root_dir)/native"
      ],
      "libraries": [
        "-lpact_ffi"
      ],
      "library_dirs": [
        "<(module_root_dir)/native"
      ],
      "ldflags": [
        "-Wl,-z,defs"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "conditions": [
        [
          "OS=='win'",
          {
            "defines": [
              "_HAS_EXCEPTIONS=1"
            ],
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1
              }
            }
          }
        ],
        [
          "OS=='mac'",
          {
            "cflags+": [
              "-fvisibility=hidden"
            ],
            "xcode_settings": {
              "GCC_SYMBOLS_PRIVATE_EXTERN": "YES",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "CLANG_CXX_LIBRARY": "libc++",
              "MACOSX_DEPLOYMENT_TARGET": "10.7"
            }
          }
        ]
      ],
      "defines": [
        "NAPI_CPP_EXCEPTIONS"
      ]
    }
  ]
}
