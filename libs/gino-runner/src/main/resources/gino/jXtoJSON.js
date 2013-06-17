(function(global) {
  
  jX.fn.toJSON = function(writer, options) {
    
    let handler = extend(new function() {
      
      function appendQuoted(s) {
        writer.write("\"");
        for(let i = 0; i < s.length; i++) {
          let c = s.charAt(i);
          if(c == "\"" || c == "\\")
            writer.write("\\");
          writer.write(c);
        }
        writer.write("\"");
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
        writer.write("[");
      };
      
      this.beforeArrayElement = function(obj, i) {
        if(i != 0)
          writer.write(",");
        writer.write(" ");
      };
      
      this.beforeMapElement = function(obj, key, i) {
        if(i != 0)
          writer.write(",");
        writer.write(" ");
        key = String(key);
        if(validIdent(key))
          writer.write(key);
        else
          appendQuoted(key)
        writer.write(": ");
      };
      
      this.beforeObject = this.beforeJavaMap = function() {
        writer.write("{");
      };
      
      this.gotArray = this.gotJavaArray = this.gotJavaCollection = function(obj, len) {
        if(len != 0)
          writer.write(" ");
        writer.write("]");
        return obj;
      };
      
      this.gotBoolean = function(b) {
        writer.write(b ? "true" : "false");
        return b;
      };
      
      this.gotJavaBoolean = function(b) {
        this.gotBoolean(b == java.lang.Boolean.TRUE);
        return b;
      };
      
      this.gotJavaChar = function(c) {
        this.gotString(String(java.lang.String.valueOf(c)));
        return c;
      };
      
      this.gotJavaNumber = function(n) {
        this.gotNumber(Number(n));
        return n;
      };
      
      this.gotJavaString = function(s) {
        this.gotString(String(s));
        return s;
      };
      
      this.gotNull = function() {
        writer.write("null");
        return null;
      };
      
      this.gotNumber = function(n) {
        writer.write(String(n % 1 == 0 ? n.toFixed() : n));
        return n;
      };
      
      this.gotObject = this.gotJavaMap = function(obj, len) {
        if(len != 0)
          writer.write(" ");
        writer.write("}");
        return obj;
      };
      
      this.gotOther = function(x) {
        this.gotString(String(x));
        return x;
      };
      
      this.gotString = function(s) {
        appendQuoted(s);
        return s;
      };
      
      this.gotUndefined = function() {
        writer.write("undefined");
      };
    }, options);
    
    return this.walk(handler);
  };
  
  jX.fn.toJSONString = function(options) {
    let writer = new java.io.StringWriter();
    this.toJSON(writer, options);
    this.obj = String(writer.toString());
    return this;
  };
  
  global.toJSON = function(obj, options) {
    return global.jX(obj).toJSONString(options).get();
  };
  
  global.toJSON = function(obj, output, options) {
    if(output == null)
      return global.jX(obj).toJSONString(options).get();
    if(isKindOf(output, java.io.Writer))
      return global.jX(obj).toJSON(output, options);
    if(isKindOf(output, java.io.OutputStream)) {
      let writer = new java.io.OutputStreamWriter(output);
      try {
        return global.jX(obj).toJSON(writer, options);
      } finally {
        writer.close();
      }
    }
    if(isKindOf(output, java.io.File)) {
      let writer = new java.io.FileWriter(output);
      try {
        return global.jX(obj).toJSON(writer, options);
      } finally {
        writer.close();
      }
    }
    throw new Error("toXML: output has unknown type");
  }
  
})(this);