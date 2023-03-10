"use strict";

const fs = require("fs");
const parser = (contents, isJSON) => {
  let text = "";
  contents
    .toString()
    .split(/\r?\n|\r/)
    .filter((line) => /^[^#]/.test(line))
    .filter((line) => /=/i.test(line))
    .reduce((memo, line) => {
      const kv = line.match(/^([^=]+)=(.*)$/);
      const key = kv[1].trim();
      const val = kv[2].trim().replace(/['"]/g, "");
      const ret = val.toLowerCase() === "true" ? true : val.toLowerCase() === "false" ? false : val;
      memo[key] = ret;
      text += `${key}=${ret},`;
      return memo;
    }, {});
  return isJSON ? contents : text.slice(0, -1);
};

const parse = function (file, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, options, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(parser(result, !!options?.isJSON));
    });
  });
};

module.exports = parse;
