load("gino/commons.js");
load("gino/services.js");

(function(global) {

  return function(scriptName, args) { // boot function
  
    // load possibly registers services, which we initialize and integrate below
    let func = load(scriptName);
  
    if(typeof func != "function") {
      if(typeof global.main == "undefined")
        throw new Error("global main function is undefined");
        
      if(typeof global.main != "function")
        throw new Error("global main object is expected to be a function");
        
      func = global.main;
    }
    
    let result = null;
    let domains = [];
    services.initServices(domains);
    try {
      services.integrateServices(domains);
      result = func(args);
    } finally {
      services.disposeServices(domains);
    }
    return result;
  }
})(this);
