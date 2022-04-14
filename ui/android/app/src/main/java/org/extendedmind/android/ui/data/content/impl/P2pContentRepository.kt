package org.extendedmind.android.ui.data.content.impl

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.delay
import org.extendedmind.android.Application
import org.extendedmind.android.R
import org.extendedmind.android.ui.data.content.ContentRepository
import org.extendedmind.android.ui.data.Result

class P2pContentRepository(private val application: Application): ContentRepository {
    private val uiPreferences: SharedPreferences = application.getSharedPreferences(
        application.getString(R.string.ui_preferences_file_key), Context.MODE_PRIVATE
    )
    private val connectShownKey =
        application.getString(R.string.ui_preferences_connect_shown_key)
    private val hubUrlKey = application.getString(R.string.ui_preferences_hub_url)
    private val hubPublicKeyKey =
        application.getString(R.string.ui_preferences_hub_public_key)

    override fun isConnectShown(): Boolean {
        return uiPreferences.getBoolean(connectShownKey, false)
    }

    override fun setHubParams(url: String, publicKey: String): Unit {
        with(uiPreferences.edit()) {
            putString(hubUrlKey, url)
            putString(hubPublicKeyKey, publicKey)
            putBoolean(connectShownKey, true)
            apply()
        }
    }

    override fun getHubUrl(): String? {
        return uiPreferences.getString(
            hubUrlKey,
            null
        )
    }

    override fun getHubPublicKey(): String? {
        return uiPreferences.getString(
            hubPublicKeyKey,
            null
        )
    }

    override suspend fun getVersion(): Result<Int> {
        delay(1000L)
        return Result.Success(0)
    }
}
