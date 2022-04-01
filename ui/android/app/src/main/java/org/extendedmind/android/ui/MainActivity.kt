package org.extendedmind.android.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import org.extendedmind.android.Application
import org.extendedmind.android.JNICallback
import org.extendedmind.android.R
import org.extendedmind.android.ui.connect.ConnectActivity


/**
 * Main class for extended mind Android UI.
 */
class MainActivity : AppCompatActivity(), JNICallback {

    private var helloWorldTextView: TextView? = null
    public override fun onCreate(savedInstanceState: Bundle?) {
        // Connect to 10.0.2.2 to access localhost

        super.onCreate(savedInstanceState)

        val uiPreferences = this.getSharedPreferences(
            getString(R.string.ui_preferences_file_key), Context.MODE_PRIVATE
        )
        val connectShown = uiPreferences.getBoolean(
            getString(R.string.ui_preferences_connect_shown_key), false
        )
        if (connectShown) {
            Log.v("Android", "Connect shown")
        } else {
            Log.v("Android", "Connect not shown")
            // startActivity(Intent(this, ConnectActivity::class.java))
        }
        setContentView(R.layout.activity_main)
        val clickMeButton = findViewById<Button>(R.id.clickMeButton)
        val textView: TextView = findViewById(R.id.helloWorldTextView)
        helloWorldTextView = textView
        val greeting = "Hello, World from Kotlin! \uD83D\uDC4B\uD83C\uDF31"
        clickMeButton.setOnClickListener { textView.text = greeting }
        Application.invokeCallbackViaJNI(this)
    }

    override fun callback(string: String) {
        helloWorldTextView!!.append("From JNI: $string\n")
    }
}

@Preview
@Composable
fun Greeting(name: String = "test") = Text(text = "Hello $name!")
