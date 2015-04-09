'use strict'

const toHTML = require('vdom-to-html')
const parse5 = require('parse5-utils')
const Parser = require('jade').Parser
const h = require('virtual-dom/h')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const Compiler = require('../lib/compiler')

describe('Compiler', function () {
  it('should throw if there is not exactly 1 tag', function () {
    assert.throws(function () {
      testCompilation('root-if')
    })

    assert.throws(function () {
      testCompilation('empty')
    })

    assert.throws(function () {
      testCompilation('multiple-tags')
    })
  })

  it('should compile the boilerplate', function () {
    let js = testCompilation('boilerplate')
    let root = eval(`(function(){${js}})()`)
    let html = toHTML(root)
    parse5.parse(html, true)
  })

  it('should compile attributes', function () {
    let js = testCompilation('attributes')
    assert(!js.match(/\bclass\b/), '`class` found somewhere!')
    assert.equal(js.match(/"className"/).length, 1, 'More than one class property set.')
  })

  it('should compile if statements', function () {
    let js = testCompilation('if')
    assert(!~js.indexOf('undefined('))
    let root = eval(`(function(){${js}})()`)
    let html = toHTML(root)
    parse5.parse(html, true)
    assert(~html.indexOf('<span></span><span></span>'))
    assert(!~html.indexOf('<em>'))
    assert(~html.indexOf('a1'))
    assert(!~html.indexOf('a2'))
    assert(!~html.indexOf('a3'))
  })

  it('should compile case statements', function () {
    let js = testCompilation('case')
  })

  it('should compile top-level JS', function () {
    let js = testCompilation('top-level-code')
    assert(~js.indexOf('var a = 1\n'))
    assert(~js.indexOf('var b = 2\n'))
  })

  it('should compile each', function () {
    let js = testCompilation('each')
  })

  it('should compile each, index', function () {
    let js = testCompilation('each-index')
    assert(~js.indexOf('anIndex'))
  })

  it('should compile each w/ expressions', function () {
    let js = testCompilation('each-expression')
  })

  it('should compile a while loop', function () {
    let js = testCompilation('while')
  })
})

function testCompilation(fixture_name) {
  let parser = new Parser(fixture(fixture_name))
  let tokens = parser.parse()
  let compiler = new Compiler(tokens, {
    pretty: true
  })
  let js = compiler.compile()
  // make sure it's syntactically valid
  new Function(js)
  return js
}

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures/' + name + '.jade'), 'utf8')
}
