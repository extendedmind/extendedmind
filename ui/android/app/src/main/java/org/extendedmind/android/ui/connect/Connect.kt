package org.extendedmind.android.ui.connect

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
fun Connect(
    appContainer: AppContainer,
    onClickConnect: (appContainer: AppContainer, url: String, publicKey: String) -> Unit
) {
    Log.v("Connect", "called")
    var urlState = remember { ValidatedUrlState() }
    var publicKeyState = remember { ValidatedPublicKeyState() }

    ExtendedMindTheme {
        Column(modifier = Modifier.padding(horizontal = 15.dp)) {
            Surface {
                Text(
                    text = "Hub address",
                    fontSize = 25.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                )
            }
            Surface {
                OutlinedTextField(
                    value = urlState.text,
                    label = { Text("url") },
                    onValueChange = {
                        urlState.text = it.trim()
                        urlState.validate()
                    },
                    isError = urlState.error != null,
                    modifier = Modifier
                        .fillMaxWidth()
                )
            }
            Surface {
                OutlinedTextField(
                    value = publicKeyState.text,
                    label = { Text("public key") },
                    onValueChange = {
                        publicKeyState.text = it.trim()
                        publicKeyState.validate()
                    },
                    isError = publicKeyState.error != null,
                    modifier = Modifier
                        .fillMaxWidth()
                )
            }
            Button(
                onClick = {onClickConnect(appContainer, urlState.text, publicKeyState.text)},
                enabled = urlState.error == null
                    && urlState.text.isNotBlank()
                    && publicKeyState.error == null
                    && publicKeyState.text.isNotBlank()
            ) {
                Text(text = "Connect")
            }
        }
    }
}
