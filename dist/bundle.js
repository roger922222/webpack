
    (function(graph) {
      function require(file) {
        function asbRequire(relPath) {
          return require(graph[file].deps[relPath])
        };

        var exports = {};

        (function (require, exports, code) {
          eval(code)
        })(asbRequire, exports, graph[file].code)

        return exports
      }
      require('./src/index.js')
    })({"./src/index.js":{"deps":{"./add.js":"./src\\add.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n// var add = require('./add.js').default\n// console.log(add(2, 4), 'add-add-add') \n\nconsole.log((0, _add[\"default\"])(2, 4));"},"./src\\add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n// exports.default = function (a, b) { return a + b }\nvar _default = function _default(a, b) {\n  return a + b;\n};\nexports[\"default\"] = _default;"}})
  