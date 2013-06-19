package org.extendedmind.bl

import org.extendedmind.domain.User
import org.extendedmind.db.GraphDatabase
import org.extendedmind.Settings
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.db.EmbeddedGraphDatabase

trait SecurityActions{

  def db: GraphDatabase;
  
  def generateToken(username: String): String = {
    "EXAMPLE_TOKEN_for_" + username
  }
}

class SecurityActionsImpl(settings: Settings)(implicit val inj: Injector) 
		extends SecurityActions with Injectable{
  def db = inject[GraphDatabase] (by default new EmbeddedGraphDatabase(settings))
}
