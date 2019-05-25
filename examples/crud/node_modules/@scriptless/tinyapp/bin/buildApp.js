const MemoryFileSystem = require('memory-fs');
const memoryFs = new MemoryFileSystem();
const webpack = require('webpack');
const path = require('path');
const generateHtml = require('./generateHtml');
const writeFileSafe = require('./writeFileSafe');
const webpackConfig = require('./webpack.dist.config');

const handleError = error => {
  console.log('❗ tinyapp failed to build\n');
  throw new Error(error);
};

const handleSuccess = () => {
  console.log('✨ tinyapp built');
};

module.exports = options => {
  const { from, to } = options;

  const compiler = webpack(webpackConfig(from));
  compiler.outputFileSystem = memoryFs;
  compiler.run((error, stats) =>
    new Promise((resolve, reject) => {
      const info = stats.toJson();

      if (error) return reject(error);

      if (stats.hasErrors()) return reject(info.errors.join('\n'));

      return resolve();
    })
      .then(() => {
        // TO DO - read these filenames from the webpack output
        const scripts = memoryFs.readFileSync('/bundle.js', 'utf8');
        const styles = memoryFs.readFileSync('/styles.css', 'utf8');
        const document = generateHtml({
          // TODO: get actual title in here
          title: '...',
          styles,
          scripts
        });

        writeFileSafe(path.resolve(to, './index.html'), document);
        handleSuccess();
      })
      .catch(handleError)
  );
};

// TO DO - create a method which returns the compiled data as a string or blob
// TO DO - add flag for using blueprint.css - or just do it by default?
// TO DO - add support for favicon path
// TO DO - add a develop tag - there needs to be some easy way of running this in watch mode, even providing a server
// TO DO - it should be possible to run this from the command line, that would be truly tinyappish
