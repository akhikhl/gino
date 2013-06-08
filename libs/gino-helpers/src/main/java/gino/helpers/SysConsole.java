package gino.helpers;

import java.io.IOException;

import org.apache.commons.lang3.StringUtils;

public class SysConsole implements IConsole {

  @Override
  public void endProgress() {
    System.out.println();
  }

  @Override
  public void info(String message) {
    System.out.println(message);
  }

  @Override
  public void progress(String message) {
    try {
      System.out.write(("\r" + StringUtils.rightPad(message, 60, ' ')).getBytes());
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    System.out.flush();
  }

  @Override
  public void startProgress(String message) {
    System.out.println(message);
  }
}
