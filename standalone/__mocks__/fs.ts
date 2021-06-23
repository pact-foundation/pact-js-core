interface Files {
  [fileName: string]: string;
}

export interface FS {
  initFS: (files: Files) => void;
  existsSync: (path: string) => boolean;
}

const mockFS: FS = jest.genMockFromModule('fs');

let mockedFiles: Files = {};

function initFS(mockFiles: Files): void {
  mockedFiles = mockFiles;

  Object.keys(mockFiles).forEach((filePath) => {
    jest.mock(filePath, () => mockFiles[filePath], { virtual: true });
  });
}

function existsSync(path: string): boolean {
  return !!mockedFiles[path];
}

mockFS.initFS = initFS;
mockFS.existsSync = existsSync;

module.exports = mockFS;
