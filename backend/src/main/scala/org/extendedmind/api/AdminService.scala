package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.bl._
import org.extendedmind.security._
import org.extendedmind.security.Authentication._
import org.extendedmind.security.Authorization._
import org.extendedmind.domain._
import org.extendedmind.domain.Owner._
import org.extendedmind.db._
import scaldi._
import spray.http._
import StatusCodes._
import spray.httpx.SprayJsonSupport._
import spray.json._
import spray.routing._
import AuthenticationFailedRejection._
import java.util.UUID
import spray.can.Http
import spray.util._
import scala.concurrent.duration._
import MediaTypes._

trait AdminService extends ServiceBase {

  import JsonImplicits._

  def adminRoutes = {
    postChangeUserType { (userUUID, userType) =>
      authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
        // Only admins can change user type
        authorize(adminAccess(securityContext)) {
          complete {
            Future[SetResult] {
              userActions.changeUserType(userUUID, userType) match {
                case Right(sr) => sr
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
      getUser { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get users for now
          authorize(adminAccess(securityContext)) {
            parameters("email") { email =>
              complete {
                Future[PublicUser] {
                  userActions.getPublicUser(email) match {
                    case Right(publicUser) => publicUser
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putInviteRequest { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can put invite requests
          authorize(adminAccess(securityContext) && settings.signUpMethod != SIGNUP_OFF) {
            entity(as[InviteRequest]) { inviteRequest =>
              complete {
                Future[SetResult] {
                  inviteActions.putNewInviteRequest(inviteRequest) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteInviteRequest { inviteRequestUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can destroy invite requests
          authorize(adminAccess(securityContext)) {
            complete {
              Future[DestroyResult] {
                inviteActions.destroyInviteRequest(inviteRequestUUID) match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getInviteRequests { path =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[InviteRequests] {
                inviteActions.getInviteRequests match {
                  case Right(inviteRequests) => inviteRequests
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postInviteRequestAccept { inviteRequestUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can accept invite requests
          authorize(adminAccess(securityContext) && settings.signUpMethod != SIGNUP_OFF) {
            entity(as[Option[InviteRequestAcceptDetails]]) { details =>
              complete {
                Future[SetResult] {
                  inviteActions.acceptInviteRequest(securityContext.userUUID, inviteRequestUUID, details) match {
                    case Right(result) => result._1
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getInvites { path =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Invites] {
                inviteActions.getInvites match {
                  case Right(invites) => invites
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewCollective { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can create new collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  collectiveActions.putNewCollective(securityContext.userUUID, collective) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can update collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  collectiveActions.putExistingCollective(collectiveUUID, collective) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get collectives for now
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Collective] {
                collectiveActions.getCollective(collectiveUUID) match {
                  case Right(collective) => collective
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postCollectiveUserPermission { (collectiveUUID, userUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only founder admin can assign people to exclusive collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[UserAccessRight]) { userAccessRight =>
              complete {
                Future[SetResult] {
                  collectiveActions.setCollectiveUserPermission(collectiveUUID, securityContext.userUUID, userUUID, userAccessRight.access) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      resetTokens { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.resetTokens match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildItemsIndex { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.rebuildItemsIndex(ownerUUID) match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildUserIndexes { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.rebuildUserIndexes match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildInviteRequestsIndex { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.rebuildInviteRequestsIndex match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~      
      migrateToLists { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.migrateToLists(ownerUUID) match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }        
      } ~
      shutdown { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              adminActions.shutdown
              in(1.second) { actorSystem.shutdown() }
              "Shutting down in 1 second..."
            }
          }
        }
      }
  }
}
