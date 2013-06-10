package gino;

import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.jar.Attributes;
import java.util.jar.Manifest;

import org.slf4j.Logger;

public class Main {

  private static final Logger logger = org.slf4j.LoggerFactory.getLogger(Main.class);

  public static void main(String[] args) throws Exception {
    System.out.println("DBG about to show manifest entries");
    ClassLoader classLoader = Main.class.getClassLoader();
    Enumeration<URL> resources = classLoader.getResources("META-INF/MANIFEST.MF");
    while (resources.hasMoreElements()) {
      InputStream stm = resources.nextElement().openStream();
      //System.out.println("DBG manifest: " + org.apache.commons.io.IOUtils.toString(stm, "UTF-8"));
      Manifest manifest = new Manifest(stm);
      for (String manKey : manifest.getEntries().keySet()) {
        System.out.println("DBG entry: " + manKey);
        Attributes attrs = manifest.getAttributes(manKey);
        if (attrs != null)
          for (Object key : attrs.keySet())
            System.out.println("  key=" + key.toString() + ", value=" + attrs.getValue(key.toString()));
      }
    }
    Runner.run("main.js", args, Main.class.getClassLoader(), logger);
  }
}
