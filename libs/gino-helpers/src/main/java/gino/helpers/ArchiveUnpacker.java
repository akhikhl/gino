package gino.helpers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.zip.GZIPInputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.archivers.ArchiveStreamFactory;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;

public class ArchiveUnpacker {

  private class UncompressCountingOutputStream extends CountingOutputStream {

    private int afterWriteCalls = 0;

    public UncompressCountingOutputStream(final OutputStream out) {
      super(out);
    }

    @Override
    protected void afterWrite(int n) throws IOException {
      ++afterWriteCalls;
      if (afterWriteCalls % 300 == 0)
        console.progress("Uncompressing bytes: " + this.getCount());
    }
  }

  private final IConsole console;

  public ArchiveUnpacker(IConsole console) {
    this.console = console;
  }

  public void unGzip(final File inputFile, final File outputFile) throws IOException {
    console.startProgress("Ungzipping file: " + inputFile.getName());
    GZIPInputStream in = null;
    FileOutputStream out = null;
    try {
      in = new GZIPInputStream(new FileInputStream(inputFile));
      out = new FileOutputStream(outputFile);
      IOUtils.copy(in, new UncompressCountingOutputStream(out));
    } finally {
      if (in != null)
        in.close();
      if (out != null)
        out.close();
      console.endProgress();
    }
  }

  public void unpack(File archiveFile, File outputDir) throws IOException, ArchiveException {
    String fileName = archiveFile.getName();
    if (fileName.endsWith(".tar.gz")) {
      File tarFile = new File(archiveFile.getParentFile(), StringUtils.removeEnd(fileName, ".tar.gz") + ".tar");
      unGzip(archiveFile, tarFile);
      unTar(tarFile, outputDir);
      tarFile.delete();
    }
    else if (fileName.endsWith(".gz")) {
      File tarFile = new File(archiveFile.getParentFile(), StringUtils.removeEnd(fileName, ".gz"));
      unGzip(archiveFile, tarFile);
    }
    else if (fileName.endsWith(".tar"))
      unTar(archiveFile, outputDir);
    else if (fileName.endsWith(".zip"))
      unZip(archiveFile, outputDir);
  }

  public void unTar(final File inputFile, final File outputDir) throws IOException, ArchiveException {
    console.startProgress("Untarring file: " + inputFile.getName());
    outputDir.mkdirs();
    final TarArchiveInputStream tarInputStream = (TarArchiveInputStream) new ArchiveStreamFactory().createArchiveInputStream(ArchiveStreamFactory.TAR, new FileInputStream(inputFile));
    try {
      TarArchiveEntry entry = null;
      while ((entry = (TarArchiveEntry) tarInputStream.getNextEntry()) != null) {
        final File outputFile = new File(outputDir, entry.getName());
        console.info(entry.getName());
        if (entry.isDirectory())
          outputFile.mkdirs();
        else {
          outputFile.getParentFile().mkdirs();
          final OutputStream outputFileStream = new FileOutputStream(outputFile);
          try {
            IOUtils.copy(tarInputStream, outputFileStream);
          } finally {
            outputFileStream.close();
          }
        }
      }
    } finally {
      tarInputStream.close();
      console.endProgress();
    }
  }

  public void unZip(final File inputFile, final File outputDir) throws IOException, ArchiveException {
    console.startProgress("Unzipping file: " + inputFile.getName());
    ZipInputStream zis = new ZipInputStream(new FileInputStream(inputFile));
    ZipEntry ze = zis.getNextEntry();
    try {
      while (ze != null) {
        final File outputFile = new File(outputDir, ze.getName());
        console.info(ze.getName());
        if (ze.isDirectory())
          outputFile.mkdirs();
        else {
          outputFile.getParentFile().mkdirs();
          final OutputStream fos = new FileOutputStream(outputFile);
          try {
            IOUtils.copy(zis, fos);
          } finally {
            fos.close();
          }
        }
        ze = zis.getNextEntry();
      }
    } finally {
      zis.close();
      console.endProgress();
    }
  }
}
