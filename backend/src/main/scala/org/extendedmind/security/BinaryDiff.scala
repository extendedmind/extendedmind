package org.extendedmind.security

import com.nothome.delta.Delta
import com.nothome.delta.GDiffPatcher

object BinaryDiff {

  def getDelta(oldData: Array[Byte], newData: Array[Byte]): Array[Byte] = {
    val delta = new Delta()
    delta.compute(oldData, newData)
  }

  def patch(source: Array[Byte], delta: Array[Byte]): Array[Byte] = {
    val patcher = new GDiffPatcher();
    patcher.patch(source, delta)
  }

}