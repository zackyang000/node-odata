import 'should';
import { min, split } from '../lib/utils';

describe('min', () => {
  return it('should work', () => {
    min([1, 10, 100]).should.be.equal(1);
    min([100, 10, 1]).should.be.equal(1);
    min([-1, 0, 1]).should.be.equal(-1);
    min([1, 0, -1]).should.be.equal(-1);
    min([5, 0, -5, 10, -10]).should.be.equal(-10);
    min([1, undefined]).should.be.equal(1);
    min([undefined, 1]).should.be.equal(1);
    min([1, 'a']).should.be.equal(1);
    min(['a', 1]).should.be.equal(1);
    min([1, 1]).should.be.equal(1);
  });
});

describe('split', () => {
  it('should work with one keyword', () => {
    const result = split("title eq 'something' and price gt 10", 'and');
    result[0].should.be.equal("title eq 'something'");
    result[1].should.be.equal("and");
    result[2].should.be.equal("price gt 10");
  });
  it('should work with one keyword(array)', () => {
    const result = split("title eq 'something' and price gt 10", ['and']);
    result[0].should.be.equal("title eq 'something'");
    result[1].should.be.equal("and");
    result[2].should.be.equal("price gt 10");
  });
  return it('should work with multiple keywords', () => {
    const result = split("title eq 'something' and price gt 10 or author eq 'somebody'", ['and', 'or']);
    result[0].should.be.equal("title eq 'something'");
    result[1].should.be.equal("and");
    result[2].should.be.equal("price gt 10");
    result[3].should.be.equal("or");
    result[4].should.be.equal("author eq 'somebody'");
  });
});
