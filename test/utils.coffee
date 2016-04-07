should = require('should')
utils = require('../lib/utils')

describe 'min', ->
  it 'should work', (done) ->
    utils.min([1, 10, 100]).should.be.equal(1)
    utils.min([100, 10, 1]).should.be.equal(1)
    utils.min([-1, 0, 1]).should.be.equal(-1)
    utils.min([1, 0, -1]).should.be.equal(-1)
    utils.min([5, 0, -5, 10, -10]).should.be.equal(-10)
    utils.min([1, undefined]).should.be.equal(1)
    utils.min([undefined, 1]).should.be.equal(1)
    utils.min([1, 'a']).should.be.equal(1)
    utils.min(['a', 1]).should.be.equal(1)
    utils.min([1, 1]).should.be.equal(1)
    done()

describe 'split', ->
  it 'should work with one keyword', (done) ->
    result = utils.split("title eq 'something' and price gt 10", 'and')
    result[0].should.be.equal("title eq 'something'")
    result[1].should.be.equal("and")
    result[2].should.be.equal("price gt 10")
    done()

  it 'should work with one keyword(array)', (done) ->
    result = utils.split("title eq 'something' and price gt 10", ['and'])
    result[0].should.be.equal("title eq 'something'")
    result[1].should.be.equal("and")
    result[2].should.be.equal("price gt 10")
    done()

  it 'should work with multiple keywords', (done) ->
    result = utils.split("title eq 'something' and price gt 10 or author eq 'somebody'", ['and', 'or'])
    result[0].should.be.equal("title eq 'something'")
    result[1].should.be.equal("and")
    result[2].should.be.equal("price gt 10")
    result[3].should.be.equal("or")
    result[4].should.be.equal("author eq 'somebody'")
    done()
