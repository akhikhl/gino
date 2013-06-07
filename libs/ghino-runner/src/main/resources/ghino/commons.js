(function(global) {

  global.System = java.lang.System;
  
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
})(this);

