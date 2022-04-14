package org.extendedmind.android.ui.focus

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.extendedmind.android.ui.data.AppContainer
import org.extendedmind.android.ui.theme.ExtendedMindTheme

@Composable
fun Focus(
    appContainer: AppContainer,
) {
    Log.v("Focus", "called")
    val focusViewModel: FocusViewModel = viewModel(
        factory = FocusViewModel.provideFactory(appContainer.contentRepository)
    )
    val uiState by focusViewModel.uiState.collectAsState()
    ExtendedMindTheme {
        Column(modifier = Modifier.padding(horizontal = 15.dp)) {
            Surface {
                Text(
                    text = "Hub url: ${appContainer.contentRepository.getHubUrl()}",
                    fontSize = 25.sp,
                )
            }
            Surface {
                Text(
                    text = "Hub public key: ${appContainer.contentRepository.getHubPublicKey()}",
                    fontSize = 25.sp,
                )
            }
            Surface {
                Text(
                    text = "Version: ${uiState.version ?: "...loading..."}",
                    fontSize = 25.sp,
                )
            }
        }
    }
}
