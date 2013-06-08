package org.extendedmind.bl

import org.extendedmind.domain.User

trait SearchIndex{
 
  def addUser(user: User): Boolean = {
    return true
  }
}
