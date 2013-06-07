package ghino.helpers;

public interface IConsole {

  void endProgress();

  void info(String message);

  void progress(String message);

  void startProgress(String message);
}
