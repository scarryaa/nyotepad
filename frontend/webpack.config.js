module.exports = {
  entry: './src/index.js',
  module: {
      rules: [
          {
              test: /\.css|\.s(c|a)ss$/,
              use: [{
                  loader: 'lit-scss-loader',
                  options: {
                      minify: true,
                  },
              }, 'extract-loader', 'css-loader', 'sass-loader'],
          },
      ],
  },
};