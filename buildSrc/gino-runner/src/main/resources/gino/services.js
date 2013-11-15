(function(global) {

  function Services() {
      
    let serviceMap = {}, serviceList = [];

    this.disposeServices = function(domains) {
      // need to destroy services in reverse order
      for(let i = serviceList.length - 1; i >= 0; i--) {
        let s = serviceList[i];
        logger.trace("Stopping service: {}", s.serviceName);
        if(typeof s.serviceController.dispose == "function") {
          logger.trace("Disposing service: {}", s.serviceName);
          let startTime = System.currentTimeMillis();
          s.serviceController.dispose(domains);
          logger.trace("Disposed service {} in {} seconds", s.serviceName, (System.currentTimeMillis() - startTime) / 1000);
        }
      }
      serviceList = [];
      serviceMap = {};
    };
    
    this.findServiceByName = function(serviceName) {
      return serviceMap[serviceName];
    };
    
    this.getServices = function() { for each(service in serviceList) yield service; };

    this.initServices = function(domains) {
      for(let i = 0; i < serviceList.length; i++) {
        let s = serviceList[i];
        logger.info("Starting service: {}", s.serviceName);
        if(typeof s.serviceController.init == "function") {
          logger.trace("Initializing service: {}", s.serviceName);
          let startTime = System.currentTimeMillis();
          s.serviceController.init(domains);
          logger.trace("Initialized service {} in {} seconds", s.serviceName, (System.currentTimeMillis() - startTime) / 1000);
        }
      }
    };

    this.integrateServices = function(domains) {
      for(let i = 0; i < serviceList.length; i++) {
        let s = serviceList[i];
        if(typeof s.serviceController.integrate == "function") {
          logger.trace("Integrating service: {}", s.serviceName);
          let startTime = System.currentTimeMillis();
          s.serviceController.integrate(domains);
          logger.trace("Integrated service {} in {} seconds", s.serviceName, (System.currentTimeMillis() - startTime) / 1000);
        }
      }
    };

    this.registerService = function(serviceName) {
      if(!(serviceName in serviceMap)) {
        // first assignment is needed to avoid possible recursions
        serviceMap[serviceName] = {};
        let serviceController = tryLoad(serviceName);
        if(serviceController == null && serviceName.slice(-3) != ".js")
          serviceController = tryLoad(serviceName + ".js");
        if(serviceController == null)
          throw new Error("Service not found: " + serviceName);
        serviceMap[serviceName] = serviceController;
        // this is needed to guarantee proper service initialization order
        serviceList.push({ serviceController: serviceController, serviceName: serviceName });
      }
    };
  }
  
  global.services = new Services();

  global.registerService = function(serviceName) {
    global.services.registerService(serviceName);
  };
  
})(this);
