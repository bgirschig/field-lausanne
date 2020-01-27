const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    experiment: './main.js',
    imageCheck: './main-imageCheck.js',
  },
  context: __dirname + "/src",
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    host: 'localhost',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: 'index.html',
      filename: 'index.html',
      chunks: ['experiment'],
    }),
    new HtmlWebpackPlugin({
      hash: true,
      template: 'imageCheck.html',
      filename: 'imageCheck.html',
      chunks: ['imageCheck'],
    }),
  ]
};