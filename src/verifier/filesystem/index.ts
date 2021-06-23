import path = require('path');
import url = require('url');
import fs = require('fs');

import { UriType } from './types';

export const getUriType = (uri: string): UriType => {
  if (/https?:/.test(url.parse(uri).protocol || '')) {
    return 'URL';
  }
  try {
    if (fs.statSync(path.normalize(uri)).isDirectory()) {
      return 'DIRECTORY';
    } else {
      return 'FILE';
    }
  } catch (e) {
    throw new Error(`Pact file or directory '${uri}' doesn't exist`);
  }
};
