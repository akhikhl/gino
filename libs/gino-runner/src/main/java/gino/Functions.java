package gino;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.text.MessageFormat;

import org.apache.commons.io.IOUtils;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeJavaClass;
import org.mozilla.javascript.NativeJavaObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Functions {

  private static final Logger logger = LoggerFactory.getLogger(Functions.class);

  public static void defineFunctions(ScriptableObject scope) {
    scope.defineFunctionProperties(new String[] {
        "isKindOf",
        "load"
    }, Functions.class, 0);
  }

  public static Object isKindOf(Context cx, Scriptable thisObj, Object[] args, Function funObj) {
    if (args == null || args.length != 2) {
      logInvalidArgs("isKindOf");
      return false;
    }
    Object obj = args[0];
    if (obj instanceof NativeJavaObject)
      obj = ((NativeJavaObject) obj).unwrap();
    Object classObj = args[1];
    if (classObj instanceof NativeArray) {
      NativeArray classes = (NativeArray) classObj;
      for (int i = 0; i < classes.getLength(); i++) {
        Object clazz = classes.get(i, classes);
        if (clazz instanceof NativeJavaClass)
          clazz = ((NativeJavaClass) clazz).unwrap();
        if (clazz instanceof Class<?> && ((Class<?>) clazz).isInstance(obj))
          return true;
      }
      return false;
    }
    if (classObj instanceof NativeJavaClass)
      classObj = ((NativeJavaClass) classObj).unwrap();
    return classObj instanceof Class<?> && ((Class<?>) classObj).isInstance(obj);
  }

  public static Object load(Context cx, Scriptable thisObj, Object[] args, Function funObj) {
    if (args == null || args.length == 0) {
      logInvalidArgs("load");
      return Context.getUndefinedValue();
    }
    Object result = Context.getUndefinedValue();
    try {
      for (Object arg : args) {
        Scriptable thisScope = thisObj == null ? funObj : thisObj;
        result = loadScript(cx, thisScope, arg);
      }
    } catch (Throwable x) {
      Context.throwAsScriptRuntimeEx(x);
    }
    return result;
  }

  public static Object loadScript(Context cx, Scriptable scope, Object scriptFile) throws Exception {
    String scriptName;
    String script;
    File file = scriptFile instanceof java.io.File ? (File) scriptFile : new File(Context.toString(scriptFile));
    if (file.exists()) {
      scriptName = file.getPath();
      InputStream ins = new BufferedInputStream(new FileInputStream(file));
      try {
        script = IOUtils.toString(ins, "UTF-8");
      } finally {
        ins.close();
      }
    }
    else {
      scriptName = scriptFile instanceof java.io.File ? ((File) scriptFile).getPath() : Context.toString(scriptFile);
      InputStream ins = cx.getApplicationClassLoader().getResourceAsStream(scriptName);
      if (ins == null)
        throw new Exception(MessageFormat.format("Script ''{0}'' not found", scriptName));
      try {
        script = IOUtils.toString(ins, "UTF-8");
      } finally {
        ins.close();
      }
    }
    return cx.evaluateString(scope, script, scriptName, 1, null);
  }

  private static void logInvalidArgs(String functionName) {
    logger.warn("Called '{}' with incorrect arguments", functionName);
  }
}
