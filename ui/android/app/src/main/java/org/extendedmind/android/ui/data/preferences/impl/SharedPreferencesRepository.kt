package org.extendedmind.android.ui.data.preferences.impl

import android.content.Context
import org.extendedmind.android.R
import org.extendedmind.android.ui.data.preferences.PreferencesRepository

class SharedPreferencesRepository(private val applicationContext: Context): PreferencesRepository {

    override fun isConnectShown(): Boolean {
        val uiPreferences = applicationContext.getSharedPreferences(
            applicationContext.getString(R.string.ui_preferences_file_key), Context.MODE_PRIVATE
        )
        return uiPreferences.getBoolean(
            applicationContext.getString(R.string.ui_preferences_connect_shown_key), false
        )
    }
}
