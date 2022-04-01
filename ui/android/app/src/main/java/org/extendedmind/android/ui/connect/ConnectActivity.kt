package org.extendedmind.android.ui.connect

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.core.view.WindowCompat
import androidx.activity.compose.setContent

/**
 * Specify how to connect to another peer
 */
class ConnectActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val appContainer = (application as org.extendedmind.android.Application).container
        setContent {
            // val windowSizeClass = rememberWindowSizeClass()
            // JetnewsApp(appContainer, windowSizeClass)
        }
    }
}
