/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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
       (access.get == FOUNDER || access.get == READ_WRITE || access.get == READ)){
      true
    }else{
      false
    }
  }
  
  def writeAccess(ownerUUID: UUID, sc: SecurityContext): Boolean = {
    val access = getAccess(ownerUUID, sc)
    if (access.isDefined && 
       (access.get == FOUNDER || access.get == READ_WRITE)){
      true
    }else{
      false
    }
  }
  
  private def getAccess(ownerUUID: UUID, sc: SecurityContext): Option[Byte] = {
    if (ownerUUID == sc.userUUID){
      Some(FOUNDER)
    }else if (sc.collectives.isDefined && sc.collectives.get.contains(ownerUUID)){
      Some(sc.collectives.get.get(ownerUUID).get._2)
    }else if (sc.sharedLists.isDefined && sc.sharedLists.get.contains(ownerUUID)){
      Some(sc.sharedLists.get.get(ownerUUID).get._4)
    }else{
      None
    }
  }
}
