package org.extendedmind.security

import java.security.NoSuchAlgorithmException
import java.security.SecureRandom
import java.security.spec.InvalidKeySpecException
import java.security.spec.KeySpec
import java.util.Arrays
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec;
import java.nio.ByteBuffer

case class Password(algorithm: String, iterations: Int, passwordHash: Array[Byte], salt: Array[Byte])

object PasswordService {

  // PBKDF2 with SHA-1 as the hashing algorithm. Note that the NIST
	// specifically names SHA-1 as an acceptable hashing algorithm for PBKDF2
  val ALGORITHM = "PBKDF2WithHmacSHA1"
  
	// Pick an iteration count that works for you. The NIST recommends at
  // least 1,000 iterations:
  // http://csrc.nist.gov/publications/nistpubs/800-132/nist-sp800-132.pdf
  // iOS 4.x reportedly uses 10,000:
  // http://blog.crackpassword.com/2010/09/smartphone-forensics-cracking-blackberry-backup-passwords/
  val ITERATIONS = 20000
  
  def authenticate(attemptedPassword: String, password: Password): Boolean = {
    println("attempted password: " + attemptedPassword)
	  // Encrypt the clear-text password using the same salt that was used to
	  // encrypt the original password
	  val encryptedAttemptedPassword = 
	    getEncryptedPassword(attemptedPassword,
                             password.salt,
                             password.algorithm,
                             password.iterations);
    
    println("passwordinfo: " + password.salt + " " + password.algorithm + " " + password.iterations)
	  // Authentication succeeds if encrypted password that the user entered
	  // is equal to the stored hash
    println("password compare: " + password.passwordHash.map("%02X" format _).mkString + " " + encryptedAttemptedPassword.passwordHash.map("%02X" format _).mkString)
	  return Arrays.equals(password.passwordHash, encryptedAttemptedPassword.passwordHash);
  }
  
  def getEncryptedPassword(password: String, salt: Array[Byte], algorithm: String, iterations: Int): Password = {
	  // SHA-1 generates 160 bit hashes, so that's what makes sense here
	  val derivedKeyLength = 160;
	  val spec = new PBEKeySpec(password.toCharArray(), salt, iterations, derivedKeyLength);
	  val f = SecretKeyFactory.getInstance(algorithm);
	  return Password(algorithm, iterations, f.generateSecret(spec).getEncoded(), salt);    
  } 
  
  def generateSalt(): Array[Byte] = {
    // VERY important to use SecureRandom instead of just Random
    val random = SecureRandom.getInstance("SHA1PRNG");

    // Generate a 8 byte (64 bit) salt as recommended by RSA PKCS5
	  val salt = new Array[Byte](8);
	  random.nextBytes(salt);
	  return salt;
  }
}