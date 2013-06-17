load("gino/services.js");
load("gino/modules.js");

(function(global) {

  return function(scriptName, args, initServices, homeFolder) { // boot function

    Object.defineProperty(global, "global", {
      value: global,
      writable: false
    });

    Object.defineProperty(global, "homeFolder", {
      value: homeFolder,
      writable: false
    });
    
    args = toJavascript(args);
    
    logger.trace("boot '{}', args={}", toJavaArray([scriptName, toJSON(args)]));
  
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
    
    let domains = [];
    if(beforeMain)
      beforeMain(args, domains);
    try {
      if(initServices) {
        services.initServices(domains);
        try {
          services.integrateServices(domains);
          result = mainFunc(args, domains);
        } finally {
          services.disposeServices(domains);
        }
      } else
        result = mainFunc(args, domains);
    } finally {
      if(afterMain)
        afterMain(args, domains);
    }
    
    return result;
  }
})(this);
