package org.extendedmind

sealed abstract class ResponseType

// List of ResponseTypes
case object INVALID_PARAMETER extends ResponseType
case object TOKEN_EXPIRED extends ResponseType
case object INTERNAL_SERVER_ERROR extends ResponseType

// Generic response
object Response{
  case class ResponseContent(responseType: ResponseType, description: String)
  type Response[T] = Either[List[ResponseContent], T]
  
  // Convenience method to use when failing
  def fail(responseType: ResponseType, description: String) = {
    Left(List(ResponseContent(responseType, description)))
  }
}

