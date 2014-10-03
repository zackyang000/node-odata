###
Operator  Description             Example
Comparison Operators
eq        Equal                   Address/City eq 'Redmond'
ne        Not equal               Address/City ne 'London'
gt        Greater than            Price gt 20
ge        Greater than or equal   Price ge 10
lt        Less than               Price lt 20
le        Less than or equal      Price le 100
has       Has flags               Style has Sales.Color'Yellow'    #todo
Logical Operators
and       Logical and             Price le 200 and Price gt 3.5
or        Logical or              Price le 3.5 or Price gt 200     #todo
not       Logical negation        not endswith(Description,'milk') #todo

eg.
  http://host/service/Products?$filter=Price lt 10.00
  http://host/service/Categories?$filter=Products/$count lt 10
###

_ = require("lodash")
functions = require("../query-functions")

module.exports = (query, $filter) ->
  return unless $filter

  for item in $filter.split('and')
    conditionArr = item.split(' ').filter (n)->n
    if conditionArr.length != 3
      throw new Error("Syntax error at '#{item}'.")
    [key, odataOperator, value] = conditionArr
    value = validator.formatValue(value)

    #has query-functions
    for oDataFunction in ['indexof']
      if key.indexOf(oDataFunction) is 0
        condition = functions[oDataFunction](key, odataOperator, value)
        query.$where(condition)
        return

    switch odataOperator
      when 'eq' then query.where(key).equals(value)
      when 'ne' then query.where(key).ne(value)
      when 'gt' then query.where(key).gt(value)
      when 'ge' then query.where(key).gte(value)
      when 'lt' then query.where(key).lt(value)
      when 'le' then query.where(key).lte(value)
      else throw new Error("Incorrect operator at '#{item}'.")


validator =
  formatValue : (value) ->
    if value == 'true' || value == 'false'
      return !!value
    if +value == +value
      return value
    if value[0] == "'" and value[value.length - 1]== "'"
      value = value.slice(1, -1)
    else
      throw new Error("Syntax error at '#{value}'.")
    value