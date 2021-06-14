module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  module: {
    rules: [
      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(scss|css)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { sourceMap: true, importLoaders: 1, modules: false },
          },

          { loader: "sass-loader", options: { sourceMap: true } },
        ],
      },
    ],
  },
};
