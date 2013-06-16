(function(global) {
  
  global.jX.fn.toJS = function() {
    
    let handler = new function() {
      
      let containerStack = [];
      
      this.beforeArray = this.beforeJavaArray = this.beforeJavaCollection = function() {
        containerStack.push([]);
      };
      
      this.beforeObject = this.beforeJavaMap = function() {
        containerStack.push({});
      };
      
      this.gotArray = this.gotJavaArray = this.gotJavaCollection = function(obj, len) {
        return containerStack.pop();
      };
      
      this.gotArrayElement = function(obj, i, elem) {
        containerStack[containerStack.length - 1].push(elem);
      };
      
      this.gotJavaBoolean = function(b) {
        return b == java.lang.Boolean.TRUE;
      };
      
      this.gotJavaChar = function(c) {
        return String(java.lang.String.valueOf(c));
      };
      
      this.gotJavaNumber = function(n) {
        return Number(n);
      };
      
      this.gotJavaString = function(str) {
        return String(str);
      };
      
      this.gotMapElement = function(obj, key, i, val) {
        containerStack[containerStack.length - 1][key] = val;
      };
      
      this.gotObject = this.gotJavaMap = function(obj, len) {
        return containerStack.pop();
      };
    };
    
    return this.walk(handler);
  }
  
  global.toJavascript = global.toJS = function(obj) {
    return global.jX(obj).toJS().get();
  };
})(this);