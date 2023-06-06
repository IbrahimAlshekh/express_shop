const fs = require("fs");
const crypto = require("crypto");

const deleteImage = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error(__filename + ": " + err);
    }
  });
};

const storeImage = (file, path) => {
  let fileName = null;
  if (file) {
    fileName = new Date().getTime() + "_" + file.name;
    new Promise((resolve, reject) => {
      file?.mv(path + fileName, (err) => {
        if (err) {
          reject(__filename + ":" + err);
        }
      });
    });
  }
  return fileName;
};

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
