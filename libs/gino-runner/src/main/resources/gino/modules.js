(function(global) {
  
  let modules = new java.util.HashSet();
  
  global.loadModule = function(moduleName) {
    if(modules.contains(moduleName))
      return;
    modules.add(moduleName);
    load(moduleName);
  };
  
})(this);
