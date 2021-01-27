#!/bin/bash -eu

npm ci --ignore-scripts
npm test
npm run download-checksums