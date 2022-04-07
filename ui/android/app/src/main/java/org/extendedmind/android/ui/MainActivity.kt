package org.extendedmind.android.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import org.extendedmind.android.Application
import org.extendedmind.android.JNICallback
import org.extendedmind.android.R
import org.extendedmind.android.ui.connect.Connect
import org.extendedmind.android.ui.connect.ConnectActivity
import org.extendedmind.android.ui.focus.Focus


/**
 * Main class for extended mind Android UI.
 */
class MainActivity : AppCompatActivity(), JNICallback {

    private var helloWorldTextView: TextView? = null
    public override fun onCreate(savedInstanceState: Bundle?) {
        // Connect to 10.0.2.2 to access localhost

        super.onCreate(savedInstanceState)


//        setContentView(R.layout.activity_main)
//        val clickMeButton = findViewById<Button>(R.id.clickMeButton)
//        val textView: TextView = findViewById(R.id.helloWorldTextView)
//        helloWorldTextView = textView
//        val greeting = "Hello, World from Kotlin! \uD83D\uDC4B\uD83C\uDF31"
//        clickMeButton.setOnClickListener { textView.text = greeting }
//        Application.invokeCallbackViaJNI(this)
    }

    override fun onStart() {
        super.onStart()
        val appContainer = (application as org.extendedmind.android.Application).container
        if (appContainer.preferencesRepository.isConnectShown()) {
            setContent {
                Focus(appContainer)
            }
        } else {
            startActivity(Intent(this, ConnectActivity::class.java))
        }
    }

    override fun callback(string: String) {
        helloWorldTextView!!.append("From JNI: $string\n")
    }
}

@Preview
@Composable
fun Greeting(name: String = "test") = Text(text = "Hello $name!")
