package ghino

import java.text.MessageFormat
import org.apache.commons.io.IOUtils
import org.mozilla.javascript.Context
import org.mozilla.javascript.ContextFactory
import org.mozilla.javascript.Function
import org.mozilla.javascript.ImporterTopLevel
import org.mozilla.javascript.Scriptable
import org.mozilla.javascript.ScriptableObject
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class Functions {

  private static final Logger logger = LoggerFactory.getLogger(Functions.class);
  
  public static void defineFunctions(ScriptableObject scope) {
    scope.defineFunctionProperties([ 
      "load" 
    ] as String[], Functions.class, 0);
  }

  public static Object load(Context cx, Scriptable thisObj, Object[] args, Function funObj) {
    if (args == null || args.length == 0) {
      logInvalidArgs(cx.get("logger"), "load");
      return Context.getUndefinedValue();
    }
    Object result = Context.getUndefinedValue();
    try {
      for (Object arg : args) {
        Scriptable thisScope = thisObj == null ? funObj : thisObj;
        result = loadScript(cx, thisScope, Context.toString(arg));
      }
    } catch (Throwable x) {
      Context.throwAsScriptRuntimeEx(x);
    }
    return result;
  }
  
  public static Object loadScript(Context cx, ScriptableObject scope, String scriptFileName) {
    String script;
    File file = new File(scriptFileName)
    if(file.exists())
      file.withInputStream { ins ->
        script = IOUtils.toString(ins, "UTF-8");
      }  
    else {
      def ins = cx.getApplicationClassLoader().getResourceAsStream(scriptFileName)
      if(ins == null)
        throw new Exception(MessageFormat.format("Script ''{0}'' not found", scriptFileName))
      script = IOUtils.toString(ins, "UTF-8")
    }
    return cx.evaluateString(scope, script, scriptFileName, 1, null)
  }

  private static void logInvalidArgs(logger, functionName) {
    logger.warn("Called '{}' with incorrect arguments", functionName);
  }
}
