# ?$select=Rating,ReleaseDate
# ->
# query.select(Rating ReleaseDate)
module.exports = (query, $select) ->
  return unless $select

  list = $select.split(',')
  list[i] = item.trim() for item, i in list
  list.push '-_id'  unless '_id' in list
  query.select(list.join(' '))
