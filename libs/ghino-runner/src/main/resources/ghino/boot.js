load("ghino/commons.js");

(function(global) {

  return function(scriptName, args) { // boot function
  
    let func = load(scriptName);
  
    if(typeof func != "function") {
      if(typeof global.main == "undefined")
        throw new Error("global main function is undefined");
        
      if(typeof global.main != "function")
        throw new Error("global main object is expected to be a function");
        
      func = global.main;
    }
    
    let jsArgs = [];
    for each(let arg in args) {
      if(isKindOf(arg, java.lang.String))
        arg = String(arg);
      jsArgs.push(arg);
    }

    func(jsArgs);
  }
})(this);
