package org.extendedmind.android;

import androidx.appcompat.app.AppCompatActivity;
import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;

/**
 * Main class for extended mind Android UI.
 */
public class MainActivity extends AppCompatActivity implements JNICallback {

    // Used to load the 'rust' library on application startup.
    static {
        System.loadLibrary("extendedmind_ui_android_jni");
    }

    TextView helloWorldTextView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.v("Android", "Hello, World!");

        setContentView(R.layout.activity_main);

        Button clickMeButton = findViewById(R.id.clickMeButton);
        helloWorldTextView = findViewById(R.id.helloWorldTextView);

        String greeting = "Hello, World! \uD83D\uDC4B\uD83C\uDF31";
        clickMeButton.setOnClickListener(v -> helloWorldTextView.setText(greeting));

        invokeCallbackViaJNI(this);
    }

    /**
     * A native method that is implemented by the native library,
     * which is packaged with this application.
     */
    public static native void invokeCallbackViaJNI(JNICallback callback);

    @Override
    public void callback(String string) {
        helloWorldTextView.append("From JNI: " + string + "\n");
    }
}
