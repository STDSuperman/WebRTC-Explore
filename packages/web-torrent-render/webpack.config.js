const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { CleanWebpackPlugin  } = require('clean-webpack-plugin')

const WORKER_OUTPUT_NAME = 'renderer-worker';

module.exports = {
  mode: 'development',
  entry: {
    'renderer-entry': './src/main.tsx',
    [WORKER_OUTPUT_NAME]: './src/worker.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      path: false,
      stream: false,
      https: false,
      http: false,
      crypto: false
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    iife: true,
    clean: true,
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      excludeChunks: [WORKER_OUTPUT_NAME]
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin()
  ],
  devServer: {
    open: false,
    port: 8080,
    compress: true,
    static: 'dist',
    liveReload: true
  }
};