package org.extendedmind.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightThemeColors = lightColors(
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color.Black,
    )
private val DarkThemeColors = darkColors(
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color.White,
)
@Composable
fun ExtendedMindTheme (
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colors = if (darkTheme) DarkThemeColors else LightThemeColors,
        typography = ExtendedMindTypography,
        content = content
    )
}
