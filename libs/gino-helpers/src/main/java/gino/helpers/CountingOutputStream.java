package gino.helpers;

import java.io.IOException;
import java.io.OutputStream;

class CountingOutputStream extends OutputStream {

  private final OutputStream proxy;
  private long count = 0;

  public CountingOutputStream(final OutputStream out) {
    assert out != null;
    this.proxy = out;
  }

  protected void afterWrite(int n) throws IOException {
  }

  public void reset() {
    this.count = 0;
  }

  public long getCount() {
    if (count >= 0 && count <= Long.MAX_VALUE)
      return count;
    throw new IllegalStateException("out bytes exceeds Long.MAX_VALUE: " + count);
  }

  @Override
  public void write(int b) throws IOException {
    ++count;
    proxy.write(b);
    afterWrite(1);
  }

  @Override
  public void write(byte[] b, int off, int len) throws IOException {
    count += len;
    proxy.write(b, off, len);
    afterWrite(len);
  }

  @Override
  public void write(byte[] b) throws IOException {
    count += b.length;
    proxy.write(b);
    afterWrite(b.length);
  }

  @Override
  public void close() throws IOException {
    proxy.close();
  }

  @Override
  public void flush() throws IOException {
    proxy.flush();
  }
}
