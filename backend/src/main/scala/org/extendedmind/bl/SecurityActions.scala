package org.extendedmind.bl

import org.extendedmind.domain.User
import org.extendedmind.db.GraphDatabase
import org.extendedmind.Settings
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.db.EmbeddedGraphDatabase

trait SecurityActions{

  def db: GraphDatabase;
  
  // TODO: Security actions here such as registration, forgot password etc.
}

class SecurityActionsImpl(implicit val settings: Settings, implicit val inj: Injector) 
		extends SecurityActions with Injectable{
  def db = inject[GraphDatabase]
}
