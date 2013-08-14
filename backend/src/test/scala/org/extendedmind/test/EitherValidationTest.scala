package org.extendedmind.test

class AdHocTest extends SpecBase{
  
  def validatePositiveInt(number: Int): Either[List[String], Integer] = {
    if (number < 0)
      Left(List("Integer not positive"))
    else
      Right(number)
  }
  
  def validateNegativeInt(number: Int): Either[List[String], Integer] = {
    if (number > 0)
      Left(List("Integer not negative"))
    else
      Right(number)
  }
  
  def validateTrueBoolean(bool: Boolean): Either[List[String], Boolean] = {
    if (!bool)
      Left(List("Boolean not true"))
    else  
      Right(bool)
  }
  
  case class PositiveNegativeIntTrueBoolean(positive: Integer, negative: Integer, bool: Boolean)
  
  describe("EitherValidation"){
    it ("should not be needed in normal for comprehensions"){
      val sum = for {
        positiveInt <- validatePositiveInt(2).right
        negativeInt <- validateNegativeInt(positiveInt * (-1)).right
        trueBoolean <- validateTrueBoolean(negativeInt<0).right
      } yield positiveInt+negativeInt
      assert(sum.right.get === 0)
    }
    it ("should not be needed when breaking on first error"){
      val sum = for {
        positiveInt <- validatePositiveInt(-2).right
        negativeInt <- validateNegativeInt(positiveInt * (-1)).right
        trueBoolean <- validateTrueBoolean(negativeInt<0).right
      } yield positiveInt+negativeInt
      assert(sum.left.get.size == 1)
    }
    
    import org.extendedmind.EitherValidation.Implicits._
    it ("should work with case classes where parameter validation is unique"){
      val pni = Right(PositiveNegativeIntTrueBoolean)(validatePositiveInt(1), validateNegativeInt(-2), validateTrueBoolean(true))      
      assert(pni === Right(PositiveNegativeIntTrueBoolean(1, -2, true)))
    }
    it ("should stack errors when more than one parameter is"){
      val pni = Right(PositiveNegativeIntTrueBoolean)(validatePositiveInt(-1), validateNegativeInt(-2), validateTrueBoolean(false))
      assert(pni === Left(List("Integer not positive", "Boolean not true")))
    }
  }
  
}