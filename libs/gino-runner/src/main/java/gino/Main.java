package gino;

import java.net.URL;
import java.util.Enumeration;
import java.util.jar.Manifest;

import org.slf4j.Logger;

public class Main {

  private static final Logger logger = org.slf4j.LoggerFactory.getLogger(Main.class);

  public static void main(String[] args) throws Exception {
    Enumeration<URL> resources = Main.class.getClassLoader().getResources("META-INF/MANIFEST.MF");
    String ginoJavascript = "main.js";
    while (resources.hasMoreElements()) {
      Manifest manifest = new Manifest(resources.nextElement().openStream());
      for (Object key : manifest.getMainAttributes().keySet()) {
        String attrName = key.toString();
        if ("Gino-Javascript".equals(attrName)) {
          ginoJavascript = manifest.getMainAttributes().getValue(attrName);
          break;
        }
      }
    }
    Runner.run(ginoJavascript, args, Main.class.getClassLoader(), logger);
  }
}
