# Developer documentation

Do this and you should be 👌👌👌:

```
bash script/download-libs.sh
npm ci
npm test
```


_notes_ - As a developer, you need to run `bash script/download-libs.sh` to download the FFI libraries prior to running `npm install` / `npm ci` as the libraries will be expected to be there, and you won't have any `node_modules` installed yet.

For end users, the `ffi` folder is populated, as part of the npm publishing step.