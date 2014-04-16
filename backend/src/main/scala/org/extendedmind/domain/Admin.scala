package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.security.SecurityContext

case class Users(users: scala.List[User])
case class InviteRequests(inviteRequests: scala.List[InviteRequest])
case class Invites(invites: scala.List[Invite])

case class Statistics(users: Long, invites: Long, inviteRequests: Long, items: Long)