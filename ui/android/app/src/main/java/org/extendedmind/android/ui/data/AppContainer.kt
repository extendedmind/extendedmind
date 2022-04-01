package org.extendedmind.android.ui.data

import android.content.Context
import android.content.SharedPreferences
import org.extendedmind.android.ui.data.preferences.PreferencesRepository
import org.extendedmind.android.ui.data.preferences.impl.SharedPreferencesRepository

/**
 * Dependency Injection container at the application level.
 */
interface AppContainer {
    val preferencesRepository: PreferencesRepository
}

/**
 * Implementation for the Dependency Injection container at the application level.
 *
 * Variables are initialized lazily and the same instance is shared across the whole app.
 */
class AppContainerImpl(private val applicationContext: Context) : AppContainer {

    override val preferencesRepository: PreferencesRepository by lazy {
        SharedPreferencesRepository(applicationContext)
    }

}
