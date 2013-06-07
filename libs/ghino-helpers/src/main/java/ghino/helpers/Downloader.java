package ghino.helpers;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.apache.commons.io.IOUtils;

public class Downloader {

  private class DownloadCountingOutputStream extends CountingOutputStream {

    private int afterWriteCalls = 0;

    public DownloadCountingOutputStream(final OutputStream out) {
      super(out);
    }

    @Override
    protected void afterWrite(int n) throws IOException {
      ++afterWriteCalls;
      if (afterWriteCalls % 300 == 0)
        console.progress("Downloaded bytes: " + this.getCount());
    }
  }

  public static boolean checkConnection(URL url) {
    try {
      HttpURLConnection urlConn = (HttpURLConnection) url.openConnection();
      urlConn.connect();
      return HttpURLConnection.HTTP_OK == urlConn.getResponseCode();
    } catch (IOException e) {
      return false;
    }
  }

  private final IConsole console;

  public Downloader(IConsole console) {
    this.console = console;
  }

  public void downloadFile(String fileName, String urlBase, File targetDir) throws IOException {
    String url = urlBase;
    if (!url.endsWith("/"))
      url += "/";
    url += fileName;
    downloadFile(new URL(url), new File(targetDir, fileName));
  }

  public void downloadFile(URL url, File file) throws IOException {
    long remoteContentLength = Long.parseLong(url.openConnection().getHeaderField("Content-Length"));
    if (file.exists() && remoteContentLength == file.length()) {
      console.info("File " + file.getName() + " already downloaded, skipping download");
      return;
    }
    console.startProgress("Downloading file: " + url.toExternalForm());
    OutputStream os = null;
    InputStream is = null;
    try {
      is = url.openStream();
      os = new FileOutputStream(file);
      IOUtils.copy(is, new DownloadCountingOutputStream(os));
    } finally {
      if (os != null)
        os.close();
      if (is != null)
        is.close();
      console.endProgress();
    }
  }
}
