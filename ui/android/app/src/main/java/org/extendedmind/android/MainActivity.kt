package org.extendedmind.android

import androidx.appcompat.app.AppCompatActivity
import org.extendedmind.android.JNICallback
import android.widget.TextView
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import org.extendedmind.android.R
import org.extendedmind.android.MainActivity

/**
 * Main class for extended mind Android UI.
 */
class MainActivity : AppCompatActivity(), JNICallback {
    /**
     * A native method that is implemented by the native library,
     * which is packaged with this application.
     */
    external fun invokeCallbackViaJNI(callback: JNICallback?)

    companion object {
        // Used to load the 'rust' library on application startup.
        init {
            System.loadLibrary("extendedmind_ui_android_jni")
        }
    }

    private var helloWorldTextView: TextView? = null
    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.v("Android", "Hello, World from Kotlin!")
        setContentView(R.layout.activity_main)
        val clickMeButton = findViewById<Button>(R.id.clickMeButton)
        val textView: TextView = findViewById(R.id.helloWorldTextView)
        helloWorldTextView = textView
        val greeting = "Hello, World from Kotlin via Bazel! \uD83D\uDC4B\uD83C\uDF31"
        clickMeButton.setOnClickListener { textView.text = greeting }
        invokeCallbackViaJNI(this)
    }

    override fun callback(string: String) {
        helloWorldTextView!!.append("From JNI: $string\n")
    }
}
