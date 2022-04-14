package org.extendedmind.android.ui.data

import org.extendedmind.android.Application
import org.extendedmind.android.ui.data.content.ContentRepository
import org.extendedmind.android.ui.data.content.impl.P2pContentRepository

/**
 * Dependency Injection container at the application level.
 */
interface AppContainer {
    val contentRepository: ContentRepository
}

/**
 * Implementation for the Dependency Injection container at the application level.
 *
 * Variables are initialized lazily and the same instance is shared across the whole app.
 */
class AppContainerImpl(private val application: Application) : AppContainer {

    override val contentRepository: ContentRepository by lazy {
        P2pContentRepository(application)
    }
}
