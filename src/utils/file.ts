const fs = require('fs');

export const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err: Error) => {
    if (err) {
      // throw new Error(err.message);
      console.log('__Error__utils__file__deleteFile__err: ', err);
    }
  });
};
