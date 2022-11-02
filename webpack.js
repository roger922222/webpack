const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')


// 分析有哪些import项
// ES6 --> ES5
/**
 * 分析单独模块
 * @param {*} file
 * 
*/
function getModuleInfo(file) {
  // 读取文件的代码
  const body = fs.readFileSync(file, 'utf-8')
  // 转换AST语法树
  // str ---> 对象 ---> 对象遍历解析
  // 编译过程 AST

  const ast = parser.parse(body, {
    sourceType: 'module' // 使用ESModule
  })

  const deps = {}

  traverse(ast, {
    // visitor
    ImportDeclaration({ node }) {
      // 遇到import节点
      const dirname = path.dirname(file)
      const abspath = './' + path.join(dirname, node.source.value)
      deps[node.source.value] = abspath
    }
  })

  // ES6 ---> ES5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  })
  const moduleInfo = {file, deps, code}
  return moduleInfo

}

// const info =  getModuleInfo('./src/index.js')
// console.log(info)

/**
 * 解析模块
 * 
*/
function parseModules(file) {
  const entry = getModuleInfo(file)
  const temp = [entry]
  const depsGraph = {}

  getDeps(temp, entry)

  temp.forEach(info => {
    depsGraph[info.file] = {
      deps: info.deps,
      code: info.code,
    }
  })

  return depsGraph
}

/**
 * 获取依赖
*/
function getDeps(temp, { deps }) {
  Object.keys(deps).forEach(key => {
    const child = getModuleInfo(deps[key])
    temp.push(child)
    getDeps(temp, child)
  })
}

function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file))

  return `
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
      require('${file}')
    })(${depsGraph})
  `
}

!fs.existsSync('./dist') && fs.mkdirSync('./dist')

fs.writeFileSync('./dist/bundle.js', bundle('./src/index.js'))

