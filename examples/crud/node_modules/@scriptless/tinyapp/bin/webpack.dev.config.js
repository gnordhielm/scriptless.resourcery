const path = require('path');
const webpack = require('webpack');


process.noDeprecation = true;

module.exports = entry => ({
  mode: 'development',
  entry: ['webpack-hot-middleware/client?reload=true', entry],
  output: {
    filename: 'bundle.js',
    path: '/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              path.resolve(__dirname, '../node_modules/babel-preset-env'),
              path.resolve(__dirname, '../node_modules/babel-preset-react'),
              path.resolve(__dirname, '../node_modules/babel-preset-stage-0')
            ]
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ],
  target: 'web',
  devtool: 'cheap-module-eval-source-map'
});
