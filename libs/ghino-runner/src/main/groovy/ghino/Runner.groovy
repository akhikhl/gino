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

class Runner {

  private static final Logger logger = LoggerFactory.getLogger(Runner.class);

  public static void main(String[] args) {      
    Context cx = ContextFactory.getGlobal().enterContext()
    try {
      cx.setLanguageVersion(Context.VERSION_1_8)
      cx.setApplicationClassLoader(Runner.class.classLoader)
      ScriptableObject scope = new ImporterTopLevel(cx)
      scope.put("logger", scope, Context.javaToJS(logger, scope));
      Functions.defineFunctions(scope)
      def bootFunc = Functions.loadScript(cx, scope, "ghino/boot.js")
      if (!(bootFunc instanceof Function))
        throw new Exception("result of boot script is expected to be a function")
      bootFunc.call(
        cx, 
        scope, 
        null, 
        [ Context.javaToJS(args, scope) ] as Object[]
      )
    } finally {
      Context.exit()
    }
  }
}
