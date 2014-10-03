# ?$skip=10
# ->
# query.skip(10)
module.exports = (query, $orderby) ->
  return unless $orderby

  order = {}
  for item in $orderby.split(',')
    data = item.trim().split(' ')
    if data.length != 2
      throw new Error("odata: Syntax error at '#{$orderby}', it's should be like 'ReleaseDate asc, Rating desc'")
    order[data[0].trim()] = data[1]
  query.sort(order)