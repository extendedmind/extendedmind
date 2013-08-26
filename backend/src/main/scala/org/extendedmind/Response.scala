package org.extendedmind

import java.util.UUID
import spray.routing._

// List of custom rejections
case class InvalidParameterRejection(description: String, throwable: Option[Throwable] = None) extends Rejection
case class TokenExpiredRejection(description: String) extends Rejection
case class InternalServerErrorRejection(description: String, throwable: Option[Throwable] = None) extends Rejection

// List of ResponseTypes
sealed abstract class ResponseType
case object INVALID_PARAMETER extends ResponseType
case object TOKEN_EXPIRED extends ResponseType
case object INTERNAL_SERVER_ERROR extends ResponseType

// Generic response
object Response{
  case class ResponseContent(responseType: ResponseType, description: String, throwable: Option[Throwable] = None){
    def throwRejectionError() = {
      responseType match {
        case INVALID_PARAMETER => 
          throw new RejectionError(
              InvalidParameterRejection(description, throwable))
        case INTERNAL_SERVER_ERROR => 
          throw new RejectionError(
              InternalServerErrorRejection(description, throwable))
        case TOKEN_EXPIRED => 
          throw new RejectionError(
              InternalServerErrorRejection(description, throwable))
      }
    }
  }
  type Response[T] = Either[List[ResponseContent], T]
  
  // Convenience methods to use when failing
  def fail(responseType: ResponseType, description: String) = {
    Left(List(ResponseContent(responseType, description)))
  }
  def fail(responseType: ResponseType, description: String, throwable: Throwable) = {
    Left(List(ResponseContent(responseType, description, Some(throwable))))
  }
  
  def processErrors(errors: List[ResponseContent]) = {
    // First log errors
    // TODO: Logging with slf4j
    
    if (!errors.isEmpty){
      // Reject based on the first exception
      errors(0).throwRejectionError
    }
    throw new RejectionError(
            InternalServerErrorRejection("Unknown error"))
  }
}

/**
 * Result that is returned from every PUT/POST method
 */
case class SetResult(uuid: Option[UUID], modified: Long)