const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

// export webpack default config
module.exports = {
  entry: {
    index: {
      import: path.resolve(__dirname, "..", "./src/index.js"),
    },
  },

  output: {
    path: path.resolve(__dirname, "build/scripts"),
    filename: "[name].bundle.js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Culinaree, All in one recipes",
      template: path.resolve(__dirname, "..", "./src/index.html"),
      filename: "index.html",
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
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
      },
      // Fonts and SVGs
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: "asset/inline",
      },
    ],
  },
  devServer: {
    contentBase: path.resolve(__dirname, "..", "./build"),
  },
};
