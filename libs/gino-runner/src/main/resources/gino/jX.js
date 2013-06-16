(function(global) {
  
  function jX(obj) {
    this.obj = obj;
  }
  
  jX.prototype.get = function() {
    return this.obj;
  };
  
  jX.prototype.walk = function(handler) {
    let walkResult = new Walker(handler).walk(this.obj);
    if(typeof handler.result == "function")
      this.obj = handler.result();
    else
      this.obj = walkResult;
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
    let defaultFunc = function(obj) { return obj; }
    delegate("beforeArray", defaultFunc);
    delegate("beforeArrayElement", defaultFunc);
    delegate("beforeJavaArray", defaultFunc);
    delegate("beforeJavaCollection", defaultFunc);
    delegate("beforeJavaMap", defaultFunc);
    delegate("beforeMapElement", defaultFunc);
    delegate("beforeObject", defaultFunc);
    delegate("gotArray", defaultFunc);
    delegate("gotJavaArray", defaultFunc);
    delegate("gotArrayElement", defaultFunc);
    delegate("gotBoolean", defaultFunc);
    delegate("gotFunction", defaultFunc);
    delegate("gotJavaBoolean", defaultFunc);
    delegate("gotJavaChar", defaultFunc);
    delegate("gotJavaCollection", defaultFunc);
    delegate("gotJavaMap", defaultFunc);
    delegate("gotJavaNumber", defaultFunc);
    delegate("gotJavaString", defaultFunc);
    delegate("gotMapElement", defaultFunc);
    delegate("gotNull", defaultFunc);
    delegate("gotNumber", defaultFunc);
    delegate("gotObject", defaultFunc);
    delegate("gotOther", defaultFunc);
    delegate("gotString", defaultFunc);
    delegate("gotUndefined", defaultFunc);
    this.handler.acceptKey = function(key) {
      if(handler.excludeKeys && handler.excludeKeys.indexOf(key) >= 0)
        return false;
      return true;
    };
  }
  
  Walker.prototype.walk = function(obj) {
    if(obj === null)
      return this.handler.gotNull();
    if(Array.isArray(obj)) {
      this.handler.beforeArray(obj);
      let i = 0;
      for(let key in obj) {
        let val = obj[key];
        if(typeof val != "undefined") {
          this.handler.beforeArrayElement(obj, i);
          this.handler.gotArrayElement(obj, i, this.walk(val));
          ++i;
        }
      }
      return this.handler.gotArray(obj, i);
    }
    if(typeof obj == "boolean")
      return this.handler.gotBoolean(obj);
    if(typeof obj == "function")
      return this.handler.gotFunction(obj);
    if(typeof obj == "number")
      return this.handler.gotNumber(obj);
    if(typeof obj == "string")
      return this.handler.gotString(obj);
    if(isKindOf(obj, java.lang.String))
      return this.handler.gotJavaString(obj);
    if(isKindOf(obj, java.lang.Number))
      return this.handler.gotJavaNumber(obj);
    if(isKindOf(obj, java.lang.Boolean))
      return this.handler.gotJavaBoolean(obj);
    if(isKindOf(obj, java.lang.Character))
      return this.handler.gotJavaChar(obj);
    if(isJavaArray(obj)) {
      this.handler.beforeJavaArray(obj);
      let len = java.lang.reflect.Array.getLength(obj);
      let i = 0;
      for(let key = 0; key < len; key++) {
        let val = java.lang.reflect.Array.get(obj, key);
        if(typeof val != "undefined") {
          this.handler.beforeArrayElement(obj, i);
          this.handler.gotArrayElement(obj, i, this.walk(val));
          ++i;
        }
      }
      return this.handler.gotJavaArray(obj, i);
    }
    if(isKindOf(obj, java.util.Collection) && obj.getClass) {
      this.handler.beforeJavaCollection(obj);
      let i = 0;
      for each(let elem in Iterator(obj.iterator()))
        if(typeof elem != "undefined") {
          this.handler.beforeArrayElement(obj, i);
          this.handler.gotArrayElement(obj, i, this.walk(elem));
          ++i;
        }
      return this.handler.gotJavaCollection(obj, i);
    }
    if(isKindOf(obj, java.util.Map) && obj.getClass) {
      this.handler.beforeJavaMap(obj);
      let i = 0;
      for each(let entry in Iterator(obj.entrySet().iterator())) {
        let key = entry.getKey();
        let val = entry.getValue();
        if(typeof val != "undefined" && this.handler.acceptKey(key)) {
          this.handler.beforeMapElement(obj, key, i);
          this.handler.gotMapElement(obj, key, i, this.walk(val));
          ++i;
        }
      }
      return this.handler.gotJavaMap(obj, i);
    }
    if(typeof obj == "object") {
      this.handler.beforeObject(obj);
      let i = 0;
      for(let [key, val] in obj)
        if(typeof val != "undefined" && this.handler.acceptKey(key)) {
          this.handler.beforeMapElement(obj, key, i);
          this.handler.gotMapElement(obj, key, i, this.walk(val));
          ++i;
        }
      return this.handler.gotObject(obj, i);
    }
    if(typeof obj == "undefined")
      return this.handler.gotUndefined(obj);
    return this.handler.gotOther(obj);
  };

  global.jX = function(obj) {
    if(obj instanceof jX)
      return obj;
    return new jX(obj);
  };
  
  global.jX.fn = jX.prototype;
  
})(this);