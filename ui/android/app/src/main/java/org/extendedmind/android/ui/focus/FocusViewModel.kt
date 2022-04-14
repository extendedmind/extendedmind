package org.extendedmind.android.ui.focus

import org.extendedmind.android.ui.data.content.ContentRepository
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.extendedmind.android.ui.data.successOr

/**
 * UI state for the Focus section
 */
data class FocusUiState(
    val version: Int? = null,
    val loading: Boolean = false,
)
class FocusViewModel(private val contentRepository: ContentRepository): ViewModel() {
    // UI state exposed to the UI
    private val _uiState = MutableStateFlow(FocusUiState(loading = true))
    val uiState: StateFlow<FocusUiState> = _uiState.asStateFlow()

    init {
        refreshAll()
    }

    private fun refreshAll() {
        _uiState.update { it.copy(loading = true) }

        viewModelScope.launch {
            // Trigger repository requests in parallel
            val versionDeferred = async { contentRepository.getVersion() }

            // Wait for all requests to finish
            val version = versionDeferred.await().successOr(null)

            _uiState.update {
                it.copy(
                    loading = false,
                    version = version,
                )
            }
        }
    }

    companion object {
        fun provideFactory(
            contentRepository: ContentRepository,
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return FocusViewModel(contentRepository) as T
            }
        }
    }
}
