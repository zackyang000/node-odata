# ?$top=10
# ->
# query.top(10)
module.exports = (query, $top) ->
  return unless $top

  count = +$top
  if count == count && count > 0
    query.limit(count)
  else
    throw new Error("Incorrect format for $top argument '#{$top}'.")