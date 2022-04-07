package org.extendedmind.android.ui.utils

import java.util.regex.Pattern

class ValidatedPublicKeyState : ValidatedTextFieldState(
    validator = ::isUrlValid,
    errorMessage = ::getPublicKeyErrorMessage

)

private const val PUBLIC_KEY_PATTERN = "^[0-9abcdef]{64}$"

private fun isUrlValid(publicKey: String): Boolean {
    return Pattern.matches(PUBLIC_KEY_PATTERN, publicKey);
}

private fun getPublicKeyErrorMessage(publicKey: String): String =
    "$publicKey is not a valid public key, needs exactly 64 characters of either numbers or the letters a,b,c,d,e or f"
