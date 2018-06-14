/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.extendedmind.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind._
import org.extendedmind.bl._
import org.extendedmind.db._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.extendedmind.test.TestGraphDatabase.TIMO_EMAIL
import org.extendedmind.test.TestGraphDatabase.TIMO_PASSWORD
import org.mockito.Mockito.reset
import org.mockito.Mockito.stub
import org.mockito.Mockito.verify
import scaldi.Module
import spray.http.BasicHttpCredentials
import spray.http.HttpHeaders.Authorization
import java.io.File
import org.apache.commons.io.FileUtils
import org.extendedmind.api.JsonImplicits._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream
import java.io.FileOutputStream
import java.util.zip.GZIPOutputStream
import java.io.BufferedOutputStream
import java.io.IOException
import org.apache.commons.compress.archivers.tar.TarArchiveEntry
import java.io.FileInputStream
import java.io.BufferedInputStream
import org.apache.commons.compress.utils.IOUtils

/**
 * Class that is used to generate .json filesDuration from the
 * service layer and also to zip the test database.
 */
class TestDataGeneratorSpec extends SpraySpecBase {

  val TEST_DATA_STORE = "target/neo4j-test-database"
  val EXPORT_TEST_DATA_STORE = "target/neo4j-test"

  // Create test database
  val db = new TestEmbeddedGraphDatabase(TEST_DATA_STORE)

  object TestDataGeneratorConfiguration extends Module{
    bind [GraphDatabase] to db
  }
  override def configurations = TestDataGeneratorConfiguration

  describe("Embedded Graph Database") {
    it("should initialize with test data") {
      db.insertTestData(Some(db.TEST_DATA_DESTINATION))
      db.shutdown(db.ds)
      packNeo4jStore
    }
  }

  def packNeo4jStore() {
    createTarFile(TEST_DATA_STORE, db.TEST_DATA_DESTINATION + "/neo4j-test.tar.gz")
    val exportStoreDir = new File(EXPORT_TEST_DATA_STORE)
    val storeDir = new File(TEST_DATA_STORE)
    if (exportStoreDir.exists()) FileUtils.deleteDirectory(exportStoreDir)
    FileUtils.copyDirectory(storeDir, new File(EXPORT_TEST_DATA_STORE))
    FileUtils.deleteDirectory(storeDir)
  }

  def createTarFile(directory: String, fileName: String) {
    var tarOs: TarArchiveOutputStream = null;
    try {
      val fos: FileOutputStream = new FileOutputStream(fileName);
      val gos: GZIPOutputStream = new GZIPOutputStream(new BufferedOutputStream(fos));
      tarOs = new TarArchiveOutputStream(gos);
      tarOs.setLongFileMode(TarArchiveOutputStream.LONGFILE_POSIX)
      val folder: File = new File(directory);
      val fileNames = folder.listFiles();
      for(file <- fileNames) {
        addFilesToTarGZ(file.getAbsolutePath(), file, tarOs, folder);
      }
    } catch {
      case e: Exception => throw new RuntimeException(e)
    } finally{
      try {
        tarOs.close();
      } catch {
        case e: Exception => throw new RuntimeException(e)
      }
    }
  }

   def addFilesToTarGZ(source: String, file: File, tos: TarArchiveOutputStream, folder: File) {
     // New TarArchiveEntry
     val relativeFilePath: String = new File(folder.toURI()).toURI().relativize(
                    new File(file.getAbsolutePath()).toURI()).getPath();
     tos.putArchiveEntry(new TarArchiveEntry(file, relativeFilePath));
     if(file.isFile()){
       val fis: FileInputStream = new FileInputStream(file);
       val bis: BufferedInputStream = new BufferedInputStream(fis);
       // Write content of the file
       IOUtils.copy(bis, tos);
       tos.closeArchiveEntry();
       fis.close();
     }else if(file.isDirectory()){
       // no need to copy any content since it is
       // a directory, just close the outputstream
       tos.closeArchiveEntry();
       for(cFile <- file.listFiles()){
         // recursively call the method for all the subfolders
         addFilesToTarGZ(cFile.getAbsolutePath(), cFile, tos, folder);
       }
     }
   }

}
