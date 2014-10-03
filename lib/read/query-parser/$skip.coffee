# ?$skip=10
# ->
# query.skip(10)
module.exports = (query, $skip) ->
  return unless $skip

  count = +$skip
  if count == count && count >= 0
    query.skip(count)
  else
    throw new Error("Incorrect format for $skip argument '#{$skip}'.")