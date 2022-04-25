package org.extendedmind.android

import org.extendedmind.android.ui.data.AppContainer
import org.extendedmind.android.ui.data.AppContainerImpl
import java.nio.ByteBuffer
import android.app.Application as AndroidApplication

class Application : AndroidApplication() {

    companion object {
        /**
         * TODO: Remove this
         */
        external fun invokeCallbackViaJNI(callback: JNICallback?)

        external fun connectToHub(dataRootDir: String, hubUrl: String, hubPublicKey: String): ByteArray
    }

    lateinit var container: AppContainer

    override fun onCreate() {
        super.onCreate()

        // Load the library here once, so that there can be multiple activities
        System.loadLibrary("extendedmind_ui_android_jni")
        container = AppContainerImpl(this)
    }
}
