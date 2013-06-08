package gino;

import org.slf4j.Logger;

public class Main {

  private static final Logger logger = org.slf4j.LoggerFactory.getLogger(Main.class);

  public static void main(String[] args) throws Exception {
    Runner.run("main.js", args, Main.class.getClassLoader(), logger);
  }
}
