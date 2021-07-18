const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// export webpack default config
module.exports = {
  entry: {
    index: {
      import: path.resolve(__dirname, "..", "./src/index.js"),
    },
  },

  output: {
    path: path.resolve(__dirname, "..", "./build"),
    filename: "[name].bundle.js",
  },
  optimization: {
    splitChunks: { chunks: "all" },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./src/index.html"),
      filename: "index.html",
      inject: "body",
    }),
    new FaviconsWebpackPlugin({
      logo: path.resolve(__dirname, "..", "./src/favico.png"),
    }),
  ],
  module: {
    rules: [
      // babel loader to compile
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      // Images
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|mp4)$/i,
        type: "asset/resource",
      },
      // Fonts and SVGs
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: "asset/inline",
      },

      {
        test: /\.(html)$/,
        exclude: /node_modules/,
        loader: "html-loader",
      },
    ],
  },
  devServer: {
    contentBase: path.resolve(__dirname, "./build"),
  },
};
