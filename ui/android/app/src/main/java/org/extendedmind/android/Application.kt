package org.extendedmind.android

import org.extendedmind.android.ui.data.AppContainer
import org.extendedmind.android.ui.data.AppContainerImpl
import android.app.Application as AndroidApplication

class Application : AndroidApplication() {

    companion object {
        /**
         * A native method that is implemented by the native library,
         * which is packaged with this application.
         */
        external fun invokeCallbackViaJNI(callback: JNICallback?)
    }

    lateinit var container: AppContainer

    override fun onCreate() {
        super.onCreate()

        // Load the library here once, so that there can be multiple activities
        System.loadLibrary("extendedmind_ui_android_jni")
        container = AppContainerImpl(this)
    }
}
