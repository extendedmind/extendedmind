package org.extendedmind.android.ui.data.content

import org.extendedmind.android.ui.data.Result

interface ContentRepository {
    // Hub settings
    fun setHubParams(url: String, publicKey: String): Unit
    fun getHubUrl(): String?
    fun getHubPublicKey(): String?

    // Content methods
    suspend fun getVersion(): Result<Int>;

    // UI Preferences
    fun isConnectShown(): Boolean
}
