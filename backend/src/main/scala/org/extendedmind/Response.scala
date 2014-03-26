package org.extendedmind

import java.util.UUID
import spray.routing._
import spray.util._
import akka.event.LoggingAdapter

// List of custom rejections
abstract class ExtendedMindException(description: String, throwable: Option[Throwable] = None) extends Exception(description) {
  if (throwable.isDefined){
    super.setStackTrace(throwable.get.getStackTrace())
  }
}
case class InvalidParameterException(description: String, throwable: Option[Throwable] = None) extends ExtendedMindException(description, throwable)
case class InvalidAuthenticationException(description: String) extends ExtendedMindException(description)
case class InternalServerErrorException(description: String, throwable: Option[Throwable] = None) extends ExtendedMindException(description, throwable)

// List of ResponseTypes
sealed abstract class ResponseType
case object INVALID_PARAMETER extends ResponseType
case object INVALID_AUTHENTICATION extends ResponseType
case object INTERNAL_SERVER_ERROR extends ResponseType

// Generic response
object Response{
  case class ResponseContent(responseType: ResponseType, description: String, throwable: Option[Throwable] = None){
    def throwRejectionError() = {
      responseType match {
        case INVALID_PARAMETER => {
          throw new InvalidParameterException(description, throwable)
        }
        case INTERNAL_SERVER_ERROR => {
          throw new InternalServerErrorException(description, throwable)
        }
        case INVALID_AUTHENTICATION => {
          throw new InvalidAuthenticationException(description)
        }
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
  
    
  def processErrors(errors: List[ResponseContent])(implicit logErrors: List[ResponseContent] => Unit) = {
    // First log all errors
    logErrors(errors)
    if (!errors.isEmpty){
      // Reject based on the first exception
      errors(0).throwRejectionError
    }else {
      throw new InternalServerErrorException("Unknown error")
    }
  }
}

/**
 * Result that is returned from every PUT/POST method
 */
case class SetResult(uuid: Option[UUID], modified: Long)

case class CountResult(count: Long)