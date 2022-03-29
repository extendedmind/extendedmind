package org.extendedmind.android

import androidx.appcompat.app.AppCompatActivity
import android.widget.TextView
import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

/**
 * Main class for extended mind Android UI.
 */
class MainActivity : AppCompatActivity(), JNICallback {

    private var helloWorldTextView: TextView? = null
    public override fun onCreate(savedInstanceState: Bundle?) {
        // Connect to 10.0.2.2 to access localhost

        super.onCreate(savedInstanceState)
        Log.v("Android", "Hello, World from Kotlin!")
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
