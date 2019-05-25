const fs = require('fs')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname

module.exports = (path, data) => {
  mkdirp(getDirName(path), (err) => {
    if (err) 
        throw new Error(err)
    return fs.writeFileSync(path, data)
  })
}