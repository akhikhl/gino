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
  
  jX.prototype.walk = function(handler) {
    new Walker(handler).walk(this.obj);
    if(typeof handler.result == "function")
      this.obj = handler.result();
    return this;
  };
  
  function Walker(handler) {
    let thisHandler = this.handler = {};
    function delegate(funcName, defaultFunc) {
      if(typeof handler[funcName] == "function")
        thisHandler[funcName] = function() {
          return handler[funcName].apply(handler, arguments); 
        }; 
      else
        thisHandler[funcName] = defaultFunc; 
    }
    let defaultFunc = function() {}
    delegate("enterArray", defaultFunc);
    delegate("enterJavaArray", defaultFunc);
    delegate("enterJavaCollection", defaultFunc);
    delegate("enterJavaMap", defaultFunc);
    delegate("enterObject", defaultFunc);
    delegate("exitArray", defaultFunc);
    delegate("exitJavaArray", defaultFunc);
    delegate("exitJavaCollection", defaultFunc);
    delegate("exitJavaMap", defaultFunc);
    delegate("exitObject", defaultFunc);
    delegate("gotArrayElement", defaultFunc);
    delegate("gotBoolean", defaultFunc);
    delegate("gotFunction", defaultFunc);
    delegate("gotMapElement", defaultFunc);
    delegate("gotNull", defaultFunc);
    delegate("gotNumber", defaultFunc);
    delegate("gotOther", defaultFunc);
    delegate("gotString", defaultFunc);
    delegate("gotJavaBoolean", defaultFunc);
    delegate("gotJavaChar", defaultFunc);
    delegate("gotJavaString", defaultFunc);
    delegate("gotJavaNumber", defaultFunc);
    delegate("gotUndefined", defaultFunc);
  }
  
  Walker.prototype.walk = function(obj) {
    if(obj === null)
      this.handler.gotNull();
    else if(Array.isArray(obj)) {
      this.handler.enterArray.apply(this.handler, arguments);
      for(let key in obj) {
        let val = obj[key];
        if(typeof val != "undefined") {
          this.handler.gotArrayElement(obj, key, val);
          this.walk(val, key);
        }
      }
      this.handler.exitArray.apply(this.handler, arguments);
    }
    else if(typeof obj == "boolean")
      this.handler.gotBoolean.apply(this.handler, arguments);
    else if(typeof obj == "function")
      this.handler.gotFunction.apply(this.handler, arguments);
    else if(typeof obj == "number")
      this.handler.gotNumber.apply(this.handler, arguments);
    else if(typeof obj == "string")
      this.handler.gotString.apply(this.handler, arguments);
    else if(isKindOf(obj, java.lang.String))
      this.handler.gotJavaString.apply(this.handler, arguments);
    else if(isKindOf(obj, java.lang.Number))
      this.handler.gotJavaNumber.apply(this.handler, arguments);
    else if(isKindOf(obj, java.lang.Boolean))
      this.handler.gotJavaBoolean.apply(this.handler, arguments);
    else if(isKindOf(obj, java.lang.Character))
      this.handler.gotJavaChar.apply(this.handler, arguments);
    else if(isJavaArray(obj)) {
      this.handler.enterJavaArray.apply(this.handler, arguments);
      let len = java.lang.reflect.Array.getLength.apply(this.handler, arguments);
      for(let i = 0; i < len; i++) {
        let val = java.lang.reflect.Array.get(obj, i);
        if(typeof val != "undefined") {
          this.handler.gotArrayElement(obj, i, val);
          this.walk(val, i);
        }
      }
      this.handler.exitJavaArray.apply(this.handler, arguments);
    }
    else if(isKindOf(obj, java.util.Collection) && obj.getClass) {
      this.handler.enterJavaCollection.apply(this.handler, arguments);
      let i = 0;
      for each(let elem in Iterator(obj.iterator()))
        if(typeof elem != "undefined") {
          this.handler.gotArrayElement(obj, i, elem);
          this.walk(elem, i);        
          ++i;
        }
      this.handler.exitJavaCollection.apply(this.handler, arguments);
    }
    else if(isKindOf(obj, java.util.Map) && obj.getClass) {
      this.handler.enterJavaMap.apply(this.handler, arguments);
      for each(let entry in Iterator(obj.entrySet().iterator()))
        if(typeof entry.getValue() != "undefined") {
          this.handler.gotMapElement(obj, entry.getKey(), entry.getValue());
          this.walk(entry.getValue(), entry.getKey());
        }
      this.handler.exitJavaMap.apply(this.handler, arguments);
    }
    else if(typeof obj == "object") {
      this.handler.enterObject.apply(this.handler, arguments);
      for(let [key, val] in obj)
        if(typeof val != "undefined") {
          this.handler.gotMapElement(obj, key, val);
          this.walk(val, key);
        }
      this.handler.exitObject.apply(this.handler, arguments);
    }
    else if(typeof obj == "undefined")
      this.handler.gotUndefined.apply(this.handler, arguments);
    else
      this.handler.gotOther.apply(this.handler, arguments);
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