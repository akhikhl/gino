(function(global) {
  
  function toJS() {
    return this.transform({
      transformJavaArray: function(arr) {
        let result = [];
        let len = java.lang.reflect.Array.getLength(arr);
        for(let i = 0; i < len; i++)
          result.push(java.lang.reflect.Array.get(arr, i));
        return result;
      },
      transformJavaBoolean: function(b) {
        return b == java.lang.Boolean.TRUE;
      },
      transformJavaCollection: function(coll) {
        let result = [];
        for each(let elem in Iterator(coll.iterator()))
          result.push(elem);
        return result;
      },
      transformJavaChar: function(c) {
        return String(java.lang.String.valueOf(c));
      },
      transformJavaMap: function(map) {
        let result = {};
        for each(let entry in Iterator(map.entrySet().iterator()))
          result[entry.getKey()] = entry.getValue();
        return result;
      },
      transformJavaNumber: function(n) {
        return Number(n);
      },
      transformJavaString: function(str) {
        return String(str);
      }
    });
  }
    
  global.jX.fn.toJS = toJS;
  
  global.toJavascript = global.toJS = function(obj) {
    return global.jX(obj).toJS().get();
  };
})(this);