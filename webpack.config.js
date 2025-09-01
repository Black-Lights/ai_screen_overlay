const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: ['./src/renderer/polyfills.ts', './src/renderer/index.tsx'],
  target: 'web', // Changed from 'electron-renderer' to 'web' for better webpack-dev-server compatibility
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/main': path.resolve(__dirname, 'src/main'),
      '@/renderer': path.resolve(__dirname, 'src/renderer'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
    },
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false,
      "stream": false,
      "buffer": require.resolve("buffer"),
      "process": require.resolve("process/browser"),
      "events": require.resolve("events")
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
            transpileOnly: true
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({
      'global': 'globalThis'
    }),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': process.env.NODE_ENV || 'development'
    }),
    new webpack.ProvidePlugin({
      global: 'globalThis',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.BannerPlugin({
      banner: 'if (typeof global === "undefined") { var global = globalThis; }',
      raw: true,
      entryOnly: false
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    port: 3000,
    hot: false, // Disable hot reload to avoid require errors
    liveReload: false, // Disable live reload as well
    client: false, // Completely disable webpack-dev-server client
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
};
