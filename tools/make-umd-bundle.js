var _ = require('lodash');

var rollup = require('rollup');
var rollupInject = require('rollup-plugin-inject');
var rollupNodeResolve = require('rollup-plugin-node-resolve');
var rollupCommonJs = require('rollup-plugin-commonjs');

var fs = require('fs');
var path = require('path');

var tslib = require('tslib');

rollup.rollup({
  entry: 'dist/esm5_for_rollup/internal/umd.js',
  plugins: [
    rollupNodeResolve({
      jsnext: true,
    }),
    rollupInject({
      exclude: 'node_modules/**',
      modules: _.mapValues(tslib, function (value, key) {
        return ['tslib', key];
      }),
    }),
    // This is needed because the jison Parser.js file is a generated CJS file
    // and otherwise would not get included correctly in the UMD build
    rollupCommonJs()
  ],
}).then(function (bundle) {
  var result = bundle.generate({
    format: 'umd',
    moduleName: 'rxjs',
    sourceMap: true
  });

  fs.writeFileSync('dist/global/rxjs.umd.js', result.code);
  fs.writeFileSync('dist/global/rxjs.umd.js.map', result.map);
});
