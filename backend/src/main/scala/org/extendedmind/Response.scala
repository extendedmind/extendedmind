package org.extendedmind

import java.util.UUID

sealed abstract class ResponseType

// List of ResponseTypes
case object INVALID_PARAMETER extends ResponseType
case object TOKEN_EXPIRED extends ResponseType
case object INTERNAL_SERVER_ERROR extends ResponseType

// Generic response
object Response{
  case class ResponseContent(responseType: ResponseType, description: String, throwable: Option[Throwable] = None)
  type Response[T] = Either[List[ResponseContent], T]
  
  // Convenience methods to use when failing
  def fail(responseType: ResponseType, description: String) = {
    Left(List(ResponseContent(responseType, description)))
  }
  def fail(responseType: ResponseType, description: String, throwable: Throwable) = {
    Left(List(ResponseContent(responseType, description, Some(throwable))))
  }
  
  // Response from set
}

/**
 * Result that is returned from every PUT/POST method
 */
case class SetResult(uuid: Option[UUID], modified: Long)