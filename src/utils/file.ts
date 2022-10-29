const fs = require('fs');

export const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err: Error) => {
    if (err) {
      throw err;
    }
  });
};
