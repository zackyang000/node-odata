

module.exports =
  # indexof(CompanyName,'X') eq 1
  indexof: (query, key, odataOperator, value) ->
    [key, target] = key.substring(key.indexOf('(') + 1, key.indexOf(')')).split(',')

    operator = convertToOperator(odataOperator)
    return query.$where("this.#{key}.indexOf(#{target}) #{operator} #{value}")

  # year(publish_date) eq 2000
  year: (query, key, odataOperator, value) ->
    key = key.substring(key.indexOf('(')+1, key.indexOf(')'))
    
    start = new Date(+value, 0, 1)
    end = new Date(+value + 1, 0, 1)

    switch odataOperator
      when 'eq' then query.where(key).gte(start).lt(end)
      when 'ne'
        condition = [{}, {}]
        condition[0][key]= {$lt: start}
        condition[1][key]= {$gte: end}
        query.or(condition)
      when 'gt' then query.where(key).gte(end)
      when 'ge' then query.where(key).gte(start)
      when 'lt' then query.where(key).lt(start)
      when 'le' then query.where(key).lt(end)
    return query

convertToOperator = (odataOperator) ->
  operator = undefined
  switch odataOperator
    when 'eq' then operator = '=='
    when 'ne' then operator = '!='
    when 'gt' then operator = '>'
    when 'ge' then operator = '>='
    when 'lt' then operator = '<'
    when 'le' then operator = '<='
  return operator

