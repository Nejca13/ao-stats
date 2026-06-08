package com.example.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.myapplication.ui.theme.AoOrange

@Composable
fun DownloadConfirmDialog(
    onDismissRequest: () -> Unit,
    onConfirm: () -> Unit
) {
    CustomDialog(
        onDismissRequest = onDismissRequest,
        title = "¿Bajar Datos?",
        content = {
            Text(
                "Se sobreescribirán todos los datos locales con la versión de la nube. Esta acción no se puede deshacer.",
                color = Color.White
            )
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = AoOrange)
            ) {
                Text("Bajar", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) {
                Text("Cancelar", color = Color.Gray)
            }
        }
    )
}

@Composable
fun UploadConfirmDialog(
    onDismissRequest: () -> Unit,
    onConfirm: (String) -> Unit,
    passwordError: Boolean
) {
    var uploadPassword by remember { mutableStateOf("") }

    CustomDialog(
        onDismissRequest = {
            onDismissRequest()
            uploadPassword = ""
        },
        title = "Subir Datos a la Nube",
        content = {
            Column {
                Text(
                    "Ingresa la contraseña para confirmar la subida.",
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = uploadPassword,
                    onValueChange = { uploadPassword = it },
                    label = { Text("Contraseña") },
                    isError = passwordError,
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = PasswordVisualTransformation(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AoOrange,
                        focusedLabelColor = AoOrange,
                        unfocusedBorderColor = Color.Gray,
                        unfocusedLabelColor = Color.Gray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
                if (passwordError) {
                    Text(
                        text = "Contraseña incorrecta",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(uploadPassword) },
                colors = ButtonDefaults.buttonColors(containerColor = AoOrange)
            ) {
                Text("Confirmar Subida", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = {
                onDismissRequest()
                uploadPassword = ""
            }) {
                Text("Cancelar", color = Color.Gray)
            }
        }
    )
}
