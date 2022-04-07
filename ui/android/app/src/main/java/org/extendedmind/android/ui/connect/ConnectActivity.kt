package org.extendedmind.android.ui.connect

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import androidx.core.view.WindowCompat
import androidx.activity.compose.setContent
import org.extendedmind.android.ui.MainActivity
import org.extendedmind.android.ui.data.AppContainer

/**
 * Specify how to connect to another peer
 */
class ConnectActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val appContainer = (application as org.extendedmind.android.Application).container
        setContent {
            Connect(appContainer, ::onClickConnect)
        }
    }

    private fun onClickConnect(appContainer: AppContainer, url: String, publicKey: String) {
        Log.v("Connect", "GOT $url and $publicKey")
        appContainer.preferencesRepository.setHubParams(url, publicKey)
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
