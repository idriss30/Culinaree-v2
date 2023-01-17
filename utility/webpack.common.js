const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const Dotenv = require("dotenv-webpack");
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
    article: {
      import: path.resolve(__dirname, "..", "./src/article.js"),
    },
    searchResult: {
      import: path.resolve(__dirname, "..", "./src/searchResult.js"),
    },

    singleRecipe: {
      import: path.resolve(__dirname, "..", "./src/singleRecipe.js"),
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
      chunks: ["index"],
      inject: "body",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./src/article.html"),
      filename: "article.html",
      chunks: ["article"],
      inject: "body",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./src/searchResult.html"),
      filename: "searchResult.html",
      chunks: ["searchResult"],
      inject: "body", //inject javascript in the body
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./src/singleRecipe.html"),
      filename: "singleRecipe.html",
      chunks: ["singleRecipe"],
      inject: "body",
    }),
    new FaviconsWebpackPlugin({
      logo: path.resolve(__dirname, "..", "./src/favico.png"),
    }),
    new Dotenv(),
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
