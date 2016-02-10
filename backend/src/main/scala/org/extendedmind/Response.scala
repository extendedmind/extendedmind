/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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

// List of ResponseTypes
sealed abstract class ResponseType
case object INVALID_PARAMETER extends ResponseType
case object INVALID_AUTHENTICATION extends ResponseType
case object INTERNAL_SERVER_ERROR extends ResponseType

case class InvalidParameterException(code: ErrorCode, description: String, throwable: Option[Throwable] = None) extends ExtendedMindException(description, throwable)
case class InvalidAuthenticationException(code: ErrorCode, description: String) extends ExtendedMindException(description)
case class InternalServerErrorException(code: ErrorCode, description: String, throwable: Option[Throwable] = None) extends ExtendedMindException(description, throwable)
case class NotAcceptableErrorException(description: String, throwable: Option[Throwable] = None) extends ExtendedMindException(description, throwable)

// Generic response
object Response{
  case class ResponseContent(responseType: ResponseType, code: ErrorCode, description: String, throwable: Option[Throwable] = None){
    def throwRejectionError() = {
      responseType match {
        case INVALID_PARAMETER => {
          throw new InvalidParameterException(code, description, throwable)
        }
        case INTERNAL_SERVER_ERROR => {
          throw new InternalServerErrorException(code, description, throwable)
        }
        case INVALID_AUTHENTICATION => {
          throw new InvalidAuthenticationException(code, description)
        }
      }
    }
  }
  type Response[T] = Either[List[ResponseContent], T]

  // Convenience methods to use when failing
  def fail(responseType: ResponseType, code: ErrorCode, description: String) = {
    Left(List(ResponseContent(responseType, code, description)))
  }
  def fail(responseType: ResponseType, code: ErrorCode, description: String, throwable: Throwable) = {
    Left(List(ResponseContent(responseType, code, description, Some(throwable))))
  }

  def processErrors(errors: List[ResponseContent], useNotAcceptable: Boolean = false)(implicit logErrors: List[ResponseContent] => Unit) = {
    // First log all errors
    logErrors(errors)
    if (useNotAcceptable){
      throw new NotAcceptableErrorException("Can not accept request")
    }else if (!errors.isEmpty){
      // Reject based on the first exception
      errors(0).throwRejectionError
    }else {
      throw new InternalServerErrorException(ERR_BASE_UNKNOWN, "Unknown error")
    }
  }
}

/**
 * Result that is returned from every successful PUT method and various other places
 */
case class SetResult(uuid: Option[UUID], created: Option[Long], modified: Long, revision: Option[Long], archived: Option[Long], associated: Option[scala.List[IdToUUID]])

object SetResult{
  def apply(uuid: Option[UUID], created: Option[Long], modified: Long)
        = new SetResult(uuid, created, modified, None, None, None)
}

case class IdToUUID(uuid: UUID, id: String)


/**
 * Result that is returned from every error response
 */
case class ErrorResult(code: Int, description: String, timestamp: Long)

/**
 * Result that is returned from successful POST where a count is returned
 */
case class CountResult(count: Long)