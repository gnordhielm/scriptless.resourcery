const express = require('express');
const path = require('path');
const opn = require('opn');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const generateHtml = require('./generateHtml');

const handleError = error => {
  console.log('❗ tinyapp failed to build\n');
  throw new Error(error);
};

const handleSuccess = port => {
  console.log('✨ tinyapp is running on localhost:' + port);
  console.log();
};

module.exports = options => {
  const webpackConfig = require('./webpack.dev.config')(options.from);

  const app = express();

  const compiler = webpack(webpackConfig);
  const middleware = webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    silent: true,
    stats: {
      colors: true,
      warnings: false,
      version: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  app.get('*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'bundle.js'), (err, bundle) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        const document = generateHtml({
          // TODO: get actual title in here
          title: '...',
          styles: '',
          scripts: bundle.toString()
        });
        res.send(document);
      }
    });
  });

  app.listen(options.port, 'localhost', err => {
    if (err) return handleError(err.message);
    opn('http://localhost:' + options.port);

    handleSuccess(options.port);
  });
};

// const MemoryFileSystem = require('memory-fs');
// const memoryFs = new MemoryFileSystem();
// const webpack = require('webpack');
// const path = require('path');
// const generateHtml = require('./generateHtml');
// const writeFileSafe = require('./writeFileSafe');
// const webpackConfig = require('./webpack.dist.config');

// module.exports = options => {
//   const { from, port } = options;

//   const compiler = webpack(webpackConfig(from));
//   compiler.outputFileSystem = memoryFs;
//   compiler.run((error, stats) =>
//     new Promise((resolve, reject) => {
//       const info = stats.toJson();

//       if (error) return reject(error);

//       if (stats.hasErrors()) return reject(info.errors.join('\n'));

//       return resolve();
//     })
//       .then(() => {
//         // TO DO - read these filenames from the webpack output
//         const scripts = memoryFs.readFileSync('/bundle.js', 'utf8');
//         const styles = memoryFs.readFileSync('/styles.css', 'utf8');
//         const document = generateHtml({
//           // TODO: get actual title in here
//           title: '...',
//           styles,
//           scripts
//         });

//         writeFileSafe(path.resolve(to, './index.html'), document);
//         handleSuccess();
//       })
//       .catch(handleError)
//   );
// };

// // TO DO - create a method which returns the compiled data as a string or blob
// // TO DO - add flag for using blueprint.css - or just do it by default?
// // TO DO - add support for favicon path
// // TO DO - add a develop tag - there needs to be some easy way of running this in watch mode, even providing a server
// // TO DO - it should be possible to run this from the command line, that would be truly tinyappish
