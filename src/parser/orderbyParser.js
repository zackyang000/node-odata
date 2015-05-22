// # ?$skip=10
// # ->
// # query.skip(10)
module.exports = function(query, $orderby) {
  if(!$orderby) {
    return;
  }

  var order = {}
  var orderbyArr = $orderby.split(',');

  for(let i = 0; i < orderbyArr.length; i++) {
    var item = orderbyArr[i];
    var data = item.trim().split(' ');
    if(data.length > 2) {
      return new Error(`odata: Syntax error at '${$orderby}', it's should be like 'ReleaseDate asc, Rating desc'`);
    }
    var key = data[0].trim();
    var value = data[1] || 'asc';
    order[key] = value;
  }
  query.sort(order);
}
