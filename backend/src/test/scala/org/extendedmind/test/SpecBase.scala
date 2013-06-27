package org.extendedmind.test

import scala.Array.canBuildFrom

import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar

abstract class SpecBase extends FunSpec 
    with BeforeAndAfter with ShouldMatchers
    with MockitoSugar{
  
  def bytes2hex(bytes: Array[Byte], sep: Option[String] = None): String = {
    sep match {
      case None => bytes.map("%02x".format(_)).mkString
      case _ => bytes.map("%02x".format(_)).mkString(sep.get)
    }
  }
}