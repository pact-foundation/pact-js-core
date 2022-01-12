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
      "conditions": [
        [
          "OS=='win'",
          {
            "libraries": [
              "<(module_root_dir)/ffi/libpact_ffi.dll.lib"
            ],
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
          "OS==\"mac\" and target_arch ==\"x64\"",
          {
            "cflags+": [
              "-fvisibility=hidden"
            ],
            "xcode_settings": {
              "GCC_SYMBOLS_PRIVATE_EXTERN": "YES",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "CLANG_CXX_LIBRARY": "libc++",
              "MACOSX_DEPLOYMENT_TARGET": "10.7"
            },
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi",
                "-Wl,-rpath,@loader_path/ffi"
              ]
            }
          }
        ],
        [
          "OS==\"mac\" and target_arch ==\"arm64\"",
          {
            "cflags+": [
              "-fvisibility=hidden"
            ],
            "xcode_settings": {
              "GCC_SYMBOLS_PRIVATE_EXTERN": "YES",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "CLANG_CXX_LIBRARY": "libc++",
              "MACOSX_DEPLOYMENT_TARGET": "10.7"
            },
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi/osxaarch64",
                "-Wl,-rpath,@loader_path/ffi/osxaarch64"
              ]
            }
          }
        ],
        [
          "OS==\"linux\"",
          {
            "link_settings": {
              "libraries": [
                "-lpact_ffi",
                "-L<(module_root_dir)/ffi",
                "-Wl,-rpath,'$$ORIGIN'/ffi"
              ]
            }
          }
        ]
      ],
      "library_dirs": [
        "<(module_root_dir)/native"
      ],
      "ldflags" : [ "-Wl,-s", "-Werror" ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "defines": [
        "NAPI_CPP_EXCEPTIONS"
      ]
    },
    # Copy the shared libraries into the build/Release folder for distribution
    {
      "target_name": "copy_release_artifacts",
      "type": "none",
      "copies": [
        {
          "files": [
            "<!(pwd)/ffi/",
          ],
          "destination": "<(PRODUCT_DIR)"
        }
      ]
    },
    # Need to set the library install name to enable the rpath settings to work on OSX
    {
      "target_name": "set_osx_install_name",
      "dependencies": ["pact"],
      "type": "none",
      "target_conditions":[
        [
          "OS==\"mac\"",
          {
            "actions": [
              {
                "action_name": "modify install_name on osx",
                "inputs": ["<!(pwd)/build/Release/pact.node"],
                "outputs": ["<!(pwd)/build/Release/pact.node"],
                'action': ['install_name_tool', '-change', 'libpact_ffi.dylib', '@rpath/libpact_ffi.dylib', '<!(pwd)/build/Release/pact.node'],
              }
            ]
          }
        ]
      ]
    }
  ]
}
