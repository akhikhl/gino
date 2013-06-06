load("ghino/commons.js");
load("main.js");

(function(global) {
  
  if(typeof global.main == "undefined")
    throw new Error("global main function is undefined");
    
  if(typeof global.main != "function")
    throw new Error("global main object is expected to be a function");

  return function(args) { // boot function
    let jsArgs = [];
    for each(let arg in args)
      jsArgs.push(String(arg));
    global.main(jsArgs);
  }
})(this);
