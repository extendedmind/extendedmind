package org.extendedmind.domain

import java.util.UUID

case class Item(uuid: Option[UUID], modified: Option[Long],
  title: String, description: Option[String])
  extends ItemLike

trait ItemLike extends Container {
  val uuid: Option[UUID] 
  val modified: Option[Long]
  val title: String
  val description: Option[String]}
  

trait ExtendedItem extends ItemLike{
  val uuid: Option[UUID]
  val modified: Option[Long] 
  val title: String
  val description: Option[String]
  val public: Option[Long]
  val collective: Option[UUID]
  val parentTask: Option[UUID]
  val parentNote: Option[UUID]
}