package org.extendedmind.android.ui.data.preferences.impl

import android.content.Context
import android.content.SharedPreferences
import org.extendedmind.android.R
import org.extendedmind.android.ui.data.preferences.PreferencesRepository

class SharedPreferencesRepository(private val applicationContext: Context) : PreferencesRepository {
    private val uiPreferences: SharedPreferences = applicationContext.getSharedPreferences(
        applicationContext.getString(R.string.ui_preferences_file_key), Context.MODE_PRIVATE
    )
    private val connectShownKey =
        applicationContext.getString(R.string.ui_preferences_connect_shown_key)
    private val hubUrlKey = applicationContext.getString(R.string.ui_preferences_hub_url)
    private val hubPublicKeyKey =
        applicationContext.getString(R.string.ui_preferences_hub_public_key)

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
}

