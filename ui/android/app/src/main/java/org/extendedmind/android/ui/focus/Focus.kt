package org.extendedmind.android.ui.focus

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.extendedmind.android.ui.data.AppContainer
import org.extendedmind.android.ui.theme.ExtendedMindTheme
import org.extendedmind.android.ui.utils.ValidatedPublicKeyState
import org.extendedmind.android.ui.utils.ValidatedUrlState

@Composable
fun Focus(
    appContainer: AppContainer,
) {
    Log.v("Focus", "called")
    ExtendedMindTheme {
        Column(modifier = Modifier.padding(horizontal = 15.dp)) {
            Surface {
                Text(
                    text = "Hub url: ${appContainer.preferencesRepository.getHubUrl()}",
                    fontSize = 25.sp,
                )
            }
            Surface {
                Text(
                    text = "Hub public key: ${appContainer.preferencesRepository.getHubPublicKey()}",
                    fontSize = 25.sp,
                )
            }
        }
    }
}
