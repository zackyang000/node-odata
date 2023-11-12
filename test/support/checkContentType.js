import 'should';

export default function checkContentType(res, value) {
  res.header.should.have.property('content-type');
  res.header['content-type'].should.containEql(value);
}