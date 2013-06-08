package gino;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.ImporterTopLevel;
import org.mozilla.javascript.ScriptableObject;

public class Runner {

  public static Object run(String scriptFileName, Object[] args, ClassLoader classLoader, Object logger) throws Exception {
    Object result;
    Context cx = ContextFactory.getGlobal().enterContext();
    try {
      cx.setLanguageVersion(Context.VERSION_1_8);
      cx.setApplicationClassLoader(classLoader);
      ScriptableObject scope = new ImporterTopLevel(cx);
      scope.put("logger", scope, Context.javaToJS(logger, scope));
      Functions.defineFunctions(scope);
      Object bootFunc = Functions.loadScript(cx, scope, "gino/boot.js");
      if (!(bootFunc instanceof Function))
        throw new Exception("result of boot script is expected to be a function");
      Object[] jsArgs = new Object[args.length];
      for (int i = 0; i < args.length; i++)
        jsArgs[i] = Context.javaToJS(args[i], scope);
      jsArgs = new Object[] { Context.javaToJS(scriptFileName, scope), Context.javaToJS(jsArgs, scope) };
      result = ((Function) bootFunc).call(cx, scope, null, jsArgs);
    } finally {
      Context.exit();
    }
    return result;
  }
}
