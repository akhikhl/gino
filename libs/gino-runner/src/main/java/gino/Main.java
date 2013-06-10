package gino;

import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.jar.Manifest;

import org.slf4j.Logger;

public class Main {

  private static final Logger logger = org.slf4j.LoggerFactory.getLogger(Main.class);

  public static void main(String[] args) throws Exception {
    System.out.println("DBG about to show manifest entries");
    ClassLoader classLoader = Main.class.getClassLoader();
    Enumeration<URL> resources = classLoader.getResources("META-INF/MANIFEST.MF");
    while (resources.hasMoreElements()) {
      URL url = resources.nextElement();
      String manifestStr = org.apache.commons.io.IOUtils.toString(url, "UTF-8");
      if (manifestStr.contains("Gino-Javascript"))
        System.out.println("DBG manifest: " + manifestStr);
      InputStream stm = url.openStream();
      Manifest manifest = new Manifest(stm);
      for (Object key : manifest.getMainAttributes().keySet()) {
        String attrName = key.toString();
        if ("Gino-Javascript".equals(attrName))
          System.out.println("  key=" + attrName + ", value=" + manifest.getMainAttributes().getValue(attrName));
      }
    }
    Runner.run("main.js", args, Main.class.getClassLoader(), logger);
  }
}
