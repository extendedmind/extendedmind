/**
 * Contains mock objects for action classes
 * TODO: Use scalamock when it supports mocking objects!
 */

package org.extendedmind.test

import org.extendedmind.bl.UserActions
import org.extendedmind.Settings
import org.extendedmind.domain.GraphDatabase
import org.extendedmind.bl.SearchIndex
import org.extendedmind.domain.User

/**
 * Mock class for user actions
 */
object MockUserActions extends UserActions{
  def db = null
  def si = null

  override def getUsers(): List[User] = {
    println("MockUserActions->getUsers")
    List()
  }

  override def addUser(user: User): User = {
    println("MockUserActions->addUser")
    user
  }
}