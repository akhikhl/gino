(function(global) {

  global.System = java.lang.System;
  global.out = java.lang.System.out;
  global.err = java.lang.System.err;
  global.ins = java.lang.System["in"];
  
  global.extend = function(obj) {
    let args = Array.prototype.slice.apply(arguments); 
    if(!obj && args.length > 1)
      obj = {};
    for(let i = 1; i < args.length; i++) {
      let ext = args[i];
      if(ext)
        for(let [key, value] in ext)
          if(typeof value != "undefined")
            obj[key] = value;
    }
    return obj;
  };
  
  global.isJavaArray = function(obj) {
    return obj && obj.getClass && obj.getClass().isArray();
  };
  
  global.isJavaPrimitiveOrWrapper = function(obj) {
    return obj && obj.getClass && org.apache.commons.lang3.ClassUtils.isPrimitiveOrWrapper(obj.getClass());
  };

  global.isScriptableObject = function(obj) {
    return isKindOf(obj, org.mozilla.javascript.ScriptableObject);
  };

  global.isJavaObject = function(obj) {
    return !isKindOf(obj, org.mozilla.javascript.ScriptableObject) && !isKindOf(obj, org.mozilla.javascript.Undefined);
  };
  
  global.normalizeLines = function(str) {
    if(!str)
      return str;
    let it = new org.apache.commons.io.LineIterator(new java.io.StringReader(str));
    let w = new java.io.StringWriter();
    let firstLine = true;
    let lineSep = System.getProperty("line.separator");
    while (it.hasNext()) {
      let line = it.nextLine().trim();
      if (!line.isEmpty()) {
        if (firstLine)
          firstLine = false;
        else
          w.write(lineSep);
        w.write(line);
      }
    }
    return String(w.toString());
  };

  /**
   * Converts javascript array to java array.
   */
  global.toJavaArray = function(arr, elemClass) {
    if(!elemClass)
      elemClass = java.lang.Object;
    if(arr != null) { 
      var result = java.lang.reflect.Array.newInstance(elemClass, arr.length);
      var i = 0;
      for(var i in arr)
        java.lang.reflect.Array.set(result, i, arr[i]);
      return result;
    }
    return java.lang.reflect.Array.newInstance(elemClass, 0);
  };
})(this);

