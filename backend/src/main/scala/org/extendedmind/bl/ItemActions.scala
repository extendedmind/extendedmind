package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.search.ElasticSearchIndex
import org.extendedmind.search.SearchIndex
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._

trait ItemActions{

  def db: GraphDatabase;
  def si: SearchIndex;
  
  def putNewItem(userUUID: UUID, item: Item): Response[SetResult] = {
    db.putNewItem(userUUID, item)
  }
  
  def putExistingItem(userUUID: UUID, itemUUID: UUID, item: Item): Response[SetResult] = {
    db.putExistingItem(userUUID, itemUUID, item)
  }
  
  def getItems(userUUID: UUID): Response[Items] = {
    db.getItems(userUUID)
  }
}

class ItemActionsImpl(implicit val settings: Settings, implicit val inj: Injector) 
		extends ItemActions with Injectable{
  def db = inject[GraphDatabase]
  def si = inject[SearchIndex]
}
