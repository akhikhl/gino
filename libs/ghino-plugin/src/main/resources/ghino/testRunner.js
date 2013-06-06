__load("gasmine/commons.js");
__load("jasmine/jasmine.js");
__load("gasmine/consoleBoot.js");
__load("gasmine/consoleReporter.js");

(function(global) {
  
  let FileFilter = java.io.FileFilter;
  let FilenameUtils = org.apache.commons.io.FilenameUtils;
  
  return function(scriptDirectory, logger) {
  
    function loadTestScripts_(folder) {
      let subFolders = folder.listFiles(FileFilter({ accept: function(f) { return f.isDirectory(); } }));
      if(subFolders != null)
        for each(let subFolder in subFolders)
          loadTestScripts_(subFolder);
      let files = folder.listFiles(FileFilter({ accept: function(f) { 
        if(!f.isFile())
          return false;
        let fname = f.getName();
        let fbaseName = FilenameUtils.getBaseName(fname);
        return fname.endsWith(".js") && (fbaseName.startsWith("Test") || fbaseName.endsWith("Test"));
      } }));
      if(files != null)
        for each(let f in files) {
          logger.trace("Loading test script: {}", f.getName());
          __load(f);
        }
    }
    
    let env = global.jasmine.getEnv();
    
    let reporter = new global.ConsoleReporter(logger);  
    env.addReporter(reporter);
    
    let globalLogger = global.logger;
    try {
      global.logger = logger; 
        
      loadTestScripts_(scriptDirectory);
      
      env.execute();
      
      if(reporter.failCount() == 0)
        logger.warn("RESULTS: {} passed.", Number(reporter.passedCount()).toFixed(0));
      else
        logger.error("RESULTS: {} passed, {} FAILED.", Number(reporter.passedCount()).toFixed(0), Number(reporter.failCount()).toFixed(0));
      
    } finally {
      global.logger = globalLogger;
    }    
    
    return reporter.failCount();
  };
})(this);
