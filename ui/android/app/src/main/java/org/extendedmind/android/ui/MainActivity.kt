package org.extendedmind.android.ui

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import org.extendedmind.android.JNICallback
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
        if (appContainer.contentRepository.isConnectShown()) {
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
