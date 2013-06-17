(function(global) {
  
  jX.fn.toJSON = function(options) {
    
    let handler = extend({}, options, new function() {
      
      let buffer = new java.lang.StringBuilder();
      
      function appendQuoted(s) {
        buffer.append("\"");
        for(let i = 0; i < s.length; i++) {
          let c = s.charAt(i);
          if(c == "\"" || c == "\\")
            buffer.append("\\");
          buffer.append(c);
        }
        buffer.append("\"");
      }
      
      function validIdent(s) {
        if(s.length == 0 || !java.lang.Character.isJavaIdentifierStart(s[0]))
          return false;
        for (let i = 1; i < s.length; i++)
          if(!java.lang.Character.isJavaIdentifierPart(s[i]))
            return false;
        return true;
      }
      
      this.beforeArray = this.beforeJavaArray = this.beforeJavaCollection = function() {
        buffer.append("[");
      };
      
      this.beforeArrayElement = function(obj, i) {
        if(i != 0)
          buffer.append(",");
        buffer.append(" ");
      };
      
      this.beforeMapElement = function(obj, key, i) {
        if(i != 0)
          buffer.append(",");
        buffer.append(" ");
        key = String(key);
        if(validIdent(key))
          buffer.append(key);
        else
          appendQuoted(key)
        buffer.append(": ");
      };
      
      this.beforeObject = this.beforeJavaMap = function() {
        buffer.append("{");
      };
      
      this.gotArray = this.gotJavaArray = this.gotJavaCollection = function(obj, len) {
        if(len != 0)
          buffer.append(" ");
        buffer.append("]");
      };
      
      this.gotBoolean = function(b) {
        buffer.append(b ? "true" : "false");
      };
      
      this.gotJavaBoolean = function(b) {
        buffer.append(b == java.lang.Boolean.TRUE ? "true" : "false");
      };
      
      this.gotJavaChar = function(c) {
        this.gotString(String(java.lang.String.valueOf(c)));
      };
      
      this.gotJavaNumber = function(n) {
        n = Number(n);
        buffer.append(n % 1 == 0 ? n.toFixed() : n);
      };
      
      this.gotJavaString = function(s) {
        appendQuoted(String(s));
      };
      
      this.gotNull = function() {
        buffer.append("null");
      };
      
      this.gotNumber = function(n) {
        buffer.append(n % 1 == 0 ? n.toFixed() : n);
      };
      
      this.gotObject = this.gotJavaMap = function(obj, len) {
        if(len != 0)
          buffer.append(" ");
        buffer.append("}");
      };
      
      this.gotOther = function(x) {
        buffer.append(String(x));
      };
      
      this.gotString = function(s) {
        appendQuoted(s);
      };
      
      this.gotUndefined = function() {
        buffer.append("undefined");
      };
      
      this.result = function() {
        return String(buffer.toString());
      };
    });
    
    return this.walk(handler);
  };
  
  global.toJSON = function(obj) {
    return global.jX(obj).toJSON().get();
  };
  
})(this);