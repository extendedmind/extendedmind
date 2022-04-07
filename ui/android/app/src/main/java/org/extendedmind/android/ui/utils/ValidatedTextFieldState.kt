package org.extendedmind.android.ui.utils

import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue

open class ValidatedTextFieldState(
    private val validator: (String) -> Boolean = { true },
    private val errorMessage: (String) -> String,

    ) {
    var text by mutableStateOf("")
    var error by mutableStateOf<String?>(null)

    fun validate() {
        error = if (validator(text)) {
            null
        } else {
            errorMessage(text)
        }
    }
}
