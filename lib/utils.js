const fs = require("fs");
const crypto = require("crypto");

const deleteImage = (path) => {
  fs.unlink(path, function(err){
    if (err) {
      console.error(__filename + ": " + err);
    }
  });
};

async function storeImage(file, path) {
  if (!file) {
    return null;
  }

  const fileName = new Date().getTime() + "_" + file.name;
  try {
    await new Promise((resolve, reject) => {
      file.mv(path + fileName, function(err){
        if (err) {
          reject(__filename + ":" + err);
        }
        resolve();
      });
    });
    return fileName;
  } catch (err) {
    console.log(__filename + ":" + err);
    throw err;
  }
}

const isIterable = (obj) => {
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
};

const getPasswordHash = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};
module.exports = {
  deleteImage,
  storeImage,
  isIterable,
  getPasswordHash,
};
