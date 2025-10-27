const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        use: [
         { 
           loader:'file-loader',
           options:{
             name: '[name].[ext]',
             outputPath:'img/'
           }
         }
        ],
      },
    ],
  },
  plugins: [
  new HtmlWebpackPlugin({
    template: './src/main.html',
    filename: 'main.html',
  }),
  new HtmlWebpackPlugin({
    template: './src/about.html',
    filename: 'about.html',
  }),
  new HtmlWebpackPlugin({
    template: './src/projects.html',
    filename: 'projects.html',
  }),
  new HtmlWebpackPlugin({
    template: './src/tasks.html',
    filename: 'tasks.html',
  }),
  new HtmlWebpackPlugin({
    template: './src/img/404 error with people holding the numbers-bro.svg',
    filename: 'src/img/404 error with people holding the numbers-bro.svg',
  }),
  new HtmlWebpackPlugin({
    template: './src/img/free-icon-list-5709520.png',
    filename: 'src/img/free-icon-list-5709520.png',
  }),
  new HtmlWebpackPlugin({
    template: './src/img/Accept tasks-bro.svg',
    filename: 'src/img/Accept tasks-bro.svg',
  }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: 'main.html',
  },
  mode: 'development',
};