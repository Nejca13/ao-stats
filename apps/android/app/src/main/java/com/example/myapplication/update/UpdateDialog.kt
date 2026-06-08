package com.example.myapplication.update

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.AoOrange

@Composable
fun UpdateDialog(
    release: GithubRelease,
    status: UpdateStatus,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = {
            if (status !is UpdateStatus.Downloading) {
                onDismiss()
            }
        },
        title = {
            Text(
                text = "Actualización disponible",
                color = AoOrange,
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp
            )
        },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                Text(
                    text = "Versión: ${release.tagName ?: "Desconocida"}",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                when (status) {
                    is UpdateStatus.Idle -> {
                        Text("Novedades:", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = release.changelog ?: "Sin descripción de novedades.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                    }
                    is UpdateStatus.Downloading -> {
                        val animatedProgress by animateFloatAsState(
                            targetValue = status.progress,
                            label = "downloadProgress"
                        )
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)
                        ) {
                            LinearProgressIndicator(
                                progress = { animatedProgress },
                                modifier = Modifier.fillMaxWidth().height(14.dp),
                                color = AoOrange,
                                trackColor = Color.DarkGray,
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Descargando... ${(status.progress * 100).toInt()}%",
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    is UpdateStatus.ReadyToInstall -> {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)
                        ) {
                            Text("Descarga completa", fontWeight = FontWeight.Bold, color = Color.Green)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "La actualización está lista para ser instalada. Si se requiere, otorga el permiso de fuentes desconocidas.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                            )
                        }
                    }
                    is UpdateStatus.Error -> {
                        Text(
                            text = "Error: ${status.message}",
                            color = MaterialTheme.colorScheme.error,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Intenta descargar nuevamente.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        },
        confirmButton = {
            if (status !is UpdateStatus.Downloading) {
                val buttonText = when (status) {
                    is UpdateStatus.ReadyToInstall -> "Instalar"
                    is UpdateStatus.Error -> "Reintentar"
                    else -> "Actualizar"
                }
                Button(
                    onClick = onConfirm,
                    colors = ButtonDefaults.buttonColors(containerColor = AoOrange)
                ) {
                    Text(buttonText, color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        },
        dismissButton = {
            if (status !is UpdateStatus.Downloading) {
                TextButton(onClick = onDismiss) {
                    Text("Más tarde", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                }
            }
        },
        containerColor = Color(0xFF1C1C1E)
    )
}

