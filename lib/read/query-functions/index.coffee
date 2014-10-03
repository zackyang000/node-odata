# indexof(CompanyName,'lfreds') eq 1

module.exports =
  indexof: (key, odataOperator, value) ->
    [innerKey, innerValue] = key.substring(key.indexOf('(')+1, key.indexOf(')')).split(',')
    switch odataOperator
      when 'eq' then operator = '=='
      when 'ne' then operator = '!='
      when 'gt' then operator = '>'
      when 'ge' then operator = '>='
      when 'lt' then operator = '<'
      when 'le' then operator = '<='
    console.log "this.#{innerKey}.indexof(#{innerValue}) #{operator} #{value}"
    "this.#{innerKey}.indexOf(#{innerValue}) #{operator} #{value}"