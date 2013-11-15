package gino;

import java.net.URL;
import java.util.Enumeration;
import java.util.jar.Manifest;

import org.slf4j.Logger;

public class Main {

  private static final Logger logger = org.slf4j.LoggerFactory.getLogger(Main.class);

  public static void main(String[] args) throws Exception {
    run(args, Main.class.getClassLoader(), logger, new java.io.File(".").getAbsolutePath());
  }

  public static void run(String[] args, ClassLoader classLoader, Logger logger, String homeFolder) throws Exception {
    Enumeration<URL> resources = classLoader.getResources("META-INF/MANIFEST.MF");
    String ginoJavascript = "main.js";
    while (resources.hasMoreElements()) {
      URL url = resources.nextElement();
      Manifest manifest = new Manifest(url.openStream());
      for (Object key : manifest.getMainAttributes().keySet()) {
        String attrName = key.toString();
        if ("Gino-Javascript".equals(attrName)) {
          ginoJavascript = manifest.getMainAttributes().getValue(attrName);
          break;
        }
      }
    }
    Runner.run(ginoJavascript, args, classLoader, logger, true, homeFolder);
  }
}
