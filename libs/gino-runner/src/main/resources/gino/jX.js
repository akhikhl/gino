(function(global) {
  
  function jX(obj) {
    this.obj = obj;
  }
  
  jX.prototype.get = function() {
    return this.obj;
  };
  
  jX.prototype.transform = function(transformer) {
    this.obj = new TransformRunner(transformer).transform(this.obj); 
    return this;
  };
  
  function TransformRunner(transformer) {
    let thisTransformer = this.transformer = {};
    function delegate(funcName, defaultFunc) {
      if(typeof transformer[funcName] == "function")
        thisTransformer[funcName] = function() {
          return transformer[funcName].apply(transformer, arguments); 
        }; 
      else
        thisTransformer[funcName] = defaultFunc; 
    }
    let defaultAccepts = function() { return true; };
    delegate("acceptKey", defaultAccepts);
    delegate("acceptValue", defaultAccepts);
    let defaultTransformation = function(obj) { return obj; }
    delegate("transformArray", defaultTransformation);
    delegate("transformBoolean", defaultTransformation);
    delegate("transformFunction", defaultTransformation);
    delegate("transformJavaArray", defaultTransformation);
    delegate("transformJavaBoolean", defaultTransformation);
    delegate("transformJavaChar", defaultTransformation);
    delegate("transformJavaCollection", defaultTransformation);
    delegate("transformJavaMap", defaultTransformation);
    delegate("transformJavaNumber", defaultTransformation);
    delegate("transformJavaString", defaultTransformation);
    delegate("transformNull", defaultTransformation);
    delegate("transformNumber", defaultTransformation);
    delegate("transformString", defaultTransformation);
    delegate("transformObject", defaultTransformation);
    delegate("transformUndefined", defaultTransformation);
  }
  
  TransformRunner.prototype.transform = function(obj) {
    return this.transformContent(this.transformValue(obj));
  };
  
  TransformRunner.prototype.transformContent = function(obj) {
    if(Array.isArray(obj)) {
      let destArr = [];
      for(let key in obj)
        if(this.transformer.acceptKey(key)) {
          let val = obj[key];
          if(this.transformer.acceptValue(val))
            destArr.push(this.transform(val));
        }
      return destArr;
    }
    if(isJavaArray(obj)) {
      let len = java.lang.reflect.Array.getLength(obj);
      let destArr = java.lang.reflect.Array.newInstance(obj.getClass().getComponentType(), len);
      for(let i = 0; i < len; i++)
        if(this.transformer.acceptKey(i)) {
          let val = java.lang.reflect.Array.get(obj, i);
          if(this.transformer.acceptValue(val))
            java.lang.reflect.Array.set(destArr, i, this.transform(val)); 
        }
      return destArr;
    }
    if(isKindOf(obj, java.util.Collection) && obj.getClass) {
      let destColl = obj.getClass().newInstance();
      let i = 0;
      for each(let elem in Iterator(obj.iterator())) {
        if (this.transformer.acceptKey(i) && this.transformer.acceptValue(elem))
          destColl.add(this.transform(elem));
        ++i;
      }
      return destColl;
    }
    if(isKindOf(obj, java.util.Map) && obj.getClass) {
      let destMap = obj.getClass().newInstance();
      for each(let entry in Iterator(sourceMap.entrySet().iterator())) {
        let key = entry.getKey();
        let val = entry.getValue();
        if (this.transformer.acceptKey(key) && this.transformer.acceptValue(val))
          destMap.put(key, this.transform(val));
      }
      return destMap;
    }
    if(obj != null && typeof obj == "object" && !isJavaPrimitiveOrWrapper(obj) && !isKindOf(obj, java.lang.String)) {
      let destObj = obj.constructor();
      for(let [key, val] in obj)
        if(this.transformer.acceptKey(key) && this.transformer.acceptValue(val))
          destObj[key] = this.transform(val);
      return destObj;
    }
    return obj;
  }
  
  TransformRunner.prototype.transformValue = function(obj) {
    if(obj === null)
      return this.transformer.transformNull(obj);
    if(Array.isArray(obj))
      return this.transformer.transformArray(obj);
    if(typeof obj == "boolean")
      return this.transformer.transformBoolean(obj);
    if(typeof obj == "function")
      return this.transformer.transformFunction(obj);
    if(typeof obj == "number")
      return this.transformer.transformNumber(obj);
    if(typeof obj == "string")
      return this.transformer.transformString(obj);
    if(isKindOf(obj, java.lang.String))
      return this.transformer.transformJavaString(obj);
    if(isKindOf(obj, java.lang.Number))
      return this.transformer.transformJavaNumber(obj);
    if(isKindOf(obj, java.lang.Boolean))
      return this.transformer.transformJavaBoolean(obj);
    if(isKindOf(obj, java.lang.Character))
      return this.transformer.transformJavaChar(obj);
    if(isJavaArray(obj))
      return this.transformer.transformJavaArray(obj);
    if(isKindOf(obj, java.util.Collection) && obj.getClass)
      return this.transformer.transformJavaCollection(obj);
    if(isKindOf(obj, java.util.Map) && obj.getClass)
      return this.transformer.transformJavaMap(obj);
    if(typeof obj == "object")
      return this.transformer.transformObject(obj);
    if(typeof obj == "undefined")
      return this.transformer.transformUndefined(obj);
    return obj;
  };

  global.jX = function(obj) {
    if(obj instanceof jX)
      return obj;
    return new jX(obj);
  };
  
  global.jX.fn = jX.prototype;
  
})(this);