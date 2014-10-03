# ?$select=Rating,ReleaseDate
# ->
# query.select(Rating ReleaseDate)
module.exports = (query, $select) ->
  return unless $select

  list = $select.split(',')
  item.trim() for item in list
  unless '_id' in list
    list.push '-_id'
  query.select(list.join(' '))
