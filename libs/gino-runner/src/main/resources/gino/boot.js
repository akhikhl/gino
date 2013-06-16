load("gino/services.js");

(function(global) {

  return function(scriptName, args) { // boot function
  
    let obj = load(scriptName);
    
    let mainFunc, beforeMain, afterMain;    
    if(typeof obj == "object") {
      if(typeof obj.main == "function")
        mainFunc = obj.main;
      if(typeof obj.beforeMain == "function")
        beforeMain = obj.beforeMain;
      if(typeof obj.afterMain == "function")
        afterMain = obj.afterMain;
    } else if(typeof obj == "function")
      mainFunc = obj;
    else if(typeof global.main == "function")
      mainFunc = global.main;
  
    if(!mainFunc)
      throw new Error("main function is undefined");
    
    let result = null;
    
    if(beforeMain)
      beforeMain(args);
    try {
      let domains = [];
      services.initServices(domains);
      try {
        services.integrateServices(domains);
        result = mainFunc(args);
      } finally {
        services.disposeServices(domains);
      }
    } finally {
      if(afterMain)
        afterMain(args);
    }
    
    return result;
  }
})(this);
