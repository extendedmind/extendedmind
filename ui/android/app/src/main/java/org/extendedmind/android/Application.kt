package org.extendedmind.android

import android.app.Application as AndroidApplication

class Application : AndroidApplication() {

    companion object {
        /**
         * A native method that is implemented by the native library,
         * which is packaged with this application.
         */
        external fun invokeCallbackViaJNI(callback: JNICallback?)
    }

    override fun onCreate() {
        super.onCreate()

        // Load the library here once, so that there can be multiple activities
        System.loadLibrary("extendedmind_ui_android_jni")
    }
}
