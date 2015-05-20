import mongoose from 'mongoose'

var isField = (obj) => {
  if(typeof(obj) === 'function')
    return true
  if(typeof(obj) === 'object'){
    if(obj.type && typeof(obj.type) === 'function'){
      // 检测该 obj 下字段, 如果有除了 type 以外是 function 类型的字段, 表明该 obj 不是基本类型
      for(name in obj){
        if(name !== 'type' && typeof(obj[name]) === 'function')
          return false;
      }
      return true;
    }
  }
  return false;
}

var isArray = (obj) => {
  return Array.isArray(obj) && obj.length >= 0;
}

var isComplexArray = (obj) => {
  return isArray(obj) && isField(obj[0]);
}

var isObject = (obj) => {
  return obj && typeof(obj) === 'object' && !isArray(obj) && !isField(obj);
}

module.exports = {
  toMetadata: (obj) => {
    convert = (obj, name, root) => {
      LEN = 'function '.length;
      if(isField(obj[name])){
        if(typeof(obj[name]) === 'function'){
          obj[name] = obj[name].toString();
          obj[name] = obj[name].substr(LEN, obj[name].indexOf('(') - LEN);
        }
        else if (typeof(obj[name]) === 'object'){
          obj[name].type = obj[name].type.toString();
          obj[name].type = obj[name].type.substr(LEN, obj[name].type.indexOf('(') - LEN);
        }
      }
      else if(isComplexArray(obj[name])){
        for(childName of obj[name][0]){
          convert(obj[name][0], childName);
        }
      }
      else if(isArray(obj[name])){
        obj[name][0] = obj[name][0].toString();
        obj[name][0] = obj[name][0].substr(LEN, obj[name][0].indexOf('(') - LEN);
      }
      else if(isObject(obj[name])){
        for(childName of obj[name]){
          convert(obj[name], childName);
        }
      }
    }
    convert({obj: obj}, 'obj', true);
    return obj;
  }
}
