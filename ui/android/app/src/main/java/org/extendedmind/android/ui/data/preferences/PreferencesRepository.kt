package org.extendedmind.android.ui.data.preferences

interface PreferencesRepository {
    fun isConnectShown(): Boolean
    fun setHubParams(url: String, publicKey: String): Unit
    fun getHubUrl(): String?
    fun getHubPublicKey(): String?
}
