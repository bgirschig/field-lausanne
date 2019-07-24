const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './main.js',
  context: __dirname + "/src",
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    host: '0.0.0.0',
    useLocalIp: true,
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.html' })]
};