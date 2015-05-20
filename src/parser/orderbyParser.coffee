# ?$skip=10
# ->
# query.skip(10)
module.exports = (query, $orderby) ->
  return unless $orderby

  order = {}
  for item in $orderby.split(',')
    data = item.trim().split(' ')
    if data.length > 2
      return new Error("odata: Syntax error at '#{$orderby}', it's should be like 'ReleaseDate asc, Rating desc'")
    key = data[0].trim()
    value = data[1] || 'asc'
    order[key] = value
  query.sort(order)
  return
