// ConsoleReporter to be used with jasmine

ConsoleReporter = function(logger) {
  
  var passedCount = 0, failCount = 0;
  
  this.passedCount = function() {
    return passedCount;
  };
  
  this.failCount = function() {
    return failCount;
  };

  this.specDone = function(result) {
    if(result.status == "failed") {
      logger.error("FAILED: {}", result.description);
      for each(let item in result.failedExpectations)
        logger.error("  failed expectation: {}", item.message);
      ++failCount;
    } else {
      logger.trace("PASS: {}", result.description);
      ++passedCount;
    }
  }
};
