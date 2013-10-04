package org.extendedmind.security

import java.util.UUID
import org.extendedmind.security.SecurityContext._
import org.extendedmind.security.Token._

object Authorization {
  
  def adminAccess(sc: SecurityContext): Boolean = {
    if (sc.userType == ADMIN) true
    else false
  }
  
  def readAccess(ownerUUID: UUID, sc: SecurityContext): Boolean = {
    val access = getAccess(ownerUUID, sc)
    if (access.isDefined && 
       (access.get == CREATOR || access.get == READ_WRITE || access.get == READ)){
      true
    }else{
      false
    }
  }
  
  def writeAccess(ownerUUID: UUID, sc: SecurityContext): Boolean = {
    val access = getAccess(ownerUUID, sc)
    if (access.isDefined && 
       (access.get == CREATOR || access.get == READ_WRITE)){
      true
    }else{
      false
    }
  }
  
  private def getAccess(ownerUUID: UUID, sc: SecurityContext): Option[Byte] = {
    if (ownerUUID == sc.userUUID){
      Some(CREATOR)
    }else if (sc.collectives.isDefined && sc.collectives.get.contains(ownerUUID)){
      Some(sc.collectives.get.get(ownerUUID).get._2)
    }else{
      None
    }
  }
}
