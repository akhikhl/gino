package gino;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.ImporterTopLevel;
import org.mozilla.javascript.ScriptableObject;

public class Runner {

  public static Context enterContext(ClassLoader classLoader) {
    Context cx = ContextFactory.getGlobal().enterContext();
    cx.setLanguageVersion(Context.VERSION_1_8);
    cx.setApplicationClassLoader(classLoader);
    return cx;
  }

  public static void exitContext() {
    Context.exit();
  }

  public static Object run(String scriptFileName, Object[] args, ClassLoader classLoader, Object logger) throws Exception {
    Object result;
    Context cx = enterContext(classLoader);
    try {
      ScriptableObject scope = new ImporterTopLevel(cx);
      scope.put("logger", scope, Context.javaToJS(logger, scope));
      Functions.defineFunctions(scope);
      Object bootFunc = Functions.loadScript(cx, scope, "gino/boot.js", true);
      if (!(bootFunc instanceof Function))
        throw new Exception("result of boot script is expected to be a function");
      Object jsArgs = ConverterToJS.convert(scope, args);
      Object[] bootArgs = new Object[] { Context.javaToJS(scriptFileName, scope), jsArgs };
      result = ((Function) bootFunc).call(cx, scope, null, bootArgs);
    } finally {
      exitContext();
    }
    return result;
  }
}
