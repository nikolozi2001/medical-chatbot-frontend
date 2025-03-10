module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 1,
      features: {
        'nesting-rules': true
      }
    }),
    require('postcss-normalize')() // Ensure this line is present
  ]
};
