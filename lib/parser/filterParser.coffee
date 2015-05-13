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
functions = require("./functionsParser")

module.exports = (query, $filter) ->
  return unless $filter

  SPLIT_MULTIPLE_CONDITIONS = /(.+?)(?:and(?=(?:[^']*'[^']*')*[^']*$)|$)/g
  SPLIT_KEY_OPERATOR_AND_VALUE = /(.+?)(?: (?=(?:[^']*'[^']*')*[^']*$)|$)/g

  if stringHelper.has $filter, 'and'
    condition = $filter.match(SPLIT_MULTIPLE_CONDITIONS).map (s) -> stringHelper.removeEndOf(s, 'and').trim()
  else
    condition = [ $filter.trim() ]

  for item in condition
    conditionArr = item.match(SPLIT_KEY_OPERATOR_AND_VALUE).map((s) -> s.trim()).filter((n) -> n)
    if conditionArr.length != 3
      return new Error("Syntax error at '#{item}'.")
    [key, odataOperator, value] = conditionArr
    value = validator.formatValue(value)

    #has query-functions
    for oDataFunction in ['indexof', 'year'] when key.indexOf("#{oDataFunction}(") is 0
      functions[oDataFunction](query, key, odataOperator, value)
      return

    switch odataOperator
      when 'eq' then query.where(key).equals(value)
      when 'ne' then query.where(key).ne(value)
      when 'gt' then query.where(key).gt(value)
      when 'ge' then query.where(key).gte(value)
      when 'lt' then query.where(key).lt(value)
      when 'le' then query.where(key).lte(value)
      else return new Error("Incorrect operator at '#{item}'.")

  return



stringHelper =
  has : (str, key) ->
    str.indexOf(key) >= 0

  isBeginWith : (str, key) ->
    str.indexOf(key) == 0

  isEndWith : (str, key) ->
    str.lastIndexOf(key) == str.length - key.length

  removeEndOf : (str, key) ->
    if stringHelper.isEndWith(str, key)
      return str.substr(0, str.length - key.length)
    return str

validator =
  formatValue : (value) ->
    return true  if  value == 'true'                                                                            # Boolean
    return false  if  value == 'false'
    return +value  if +value == +value                                                                          # Number
    return value.slice(1, -1)  if stringHelper.isBeginWith(value, "'") and stringHelper.isEndWith(value, "'")   # String
    return new Error("Syntax error at '#{value}'.")
