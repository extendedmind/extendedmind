package org.extendedmind.search

import org.extendedmind.domain.User

trait SearchIndex{
 
  def addUser(user: User): Boolean = {
    return true
  }
}
