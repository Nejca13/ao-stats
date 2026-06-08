package com.example.myapplication.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.components.DownloadConfirmDialog
import com.example.myapplication.ui.components.UploadConfirmDialog
import com.example.myapplication.ui.theme.AoOrange
import com.example.myapplication.ui.viewmodel.MainViewModel


@Composable
fun SyncScreen(viewModel: MainViewModel) {
    val loggedIn by viewModel.loggedIn.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val success by viewModel.success.collectAsState()
    val context = androidx.compose.ui.platform.LocalContext.current

    var showDownloadConfirm by remember { mutableStateOf(false) }
    var showUploadConfirm by remember { mutableStateOf(false) }
    var passwordError by remember { mutableStateOf(false) }

    LaunchedEffect(error) {
        error?.let {
            android.widget.Toast.makeText(context, it, android.widget.Toast.LENGTH_LONG).show()
            viewModel.clearError()
        }
    }

    LaunchedEffect(success) {
        success?.let {
            android.widget.Toast.makeText(context, it, android.widget.Toast.LENGTH_SHORT).show()
            viewModel.clearSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Sincronización Manual",
            style = MaterialTheme.typography.headlineSmall,
            color = AoOrange,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Gestiona tus datos con la nube. Esta operación requiere conexión a Internet.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(24.dp))

        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            color = if (loggedIn) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                   else MaterialTheme.colorScheme.error.copy(alpha = 0.1f),
        ) {
            Text(
                text = if (loggedIn) "Sesion iniciada - los datos V2 estan disponibles"
                       else "Sin sesion - inicia sesion en la pestana Cuenta",
                modifier = Modifier.padding(12.dp),
                fontSize = 13.sp,
                color = if (loggedIn) MaterialTheme.colorScheme.primary
                       else MaterialTheme.colorScheme.error,
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { showUploadConfirm = true },
            enabled = !loading,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AoOrange),
            shape = MaterialTheme.shapes.medium
        ) {
            Text("Subir datos a la nube", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedButton(
            onClick = { showDownloadConfirm = true },
            enabled = !loading,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = AoOrange),
            border = androidx.compose.foundation.BorderStroke(1.dp, AoOrange),
            shape = MaterialTheme.shapes.medium
        ) {
            Text("Bajar datos de la nube", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }

        if (loggedIn) {
            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Sincronizacion V2 (grupo)",
                style = MaterialTheme.typography.titleSmall,
                color = AoOrange,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = {
                    viewModel.refreshDataV2()
                },
                enabled = !loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AoOrange),
                border = androidx.compose.foundation.BorderStroke(1.dp, AoOrange),
                shape = MaterialTheme.shapes.medium
            ) {
                Text("Bajar datos V2 (asociados al grupo)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }

    if (loading) {
        androidx.compose.ui.window.Dialog(onDismissRequest = {}) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(MaterialTheme.colorScheme.surface, MaterialTheme.shapes.medium),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = AoOrange)
            }
        }
    }

    if (showDownloadConfirm) {
        DownloadConfirmDialog(
            onDismissRequest = { showDownloadConfirm = false },
            onConfirm = {
                viewModel.refreshData()
                showDownloadConfirm = false
            }
        )
    }

    if (showUploadConfirm) {
        UploadConfirmDialog(
            onDismissRequest = {
                showUploadConfirm = false
                passwordError = false
            },
            onConfirm = { password ->
                if (password == "mumbongopro") {
                    viewModel.uploadData()
                    showUploadConfirm = false
                } else {
                    passwordError = true
                }
            },
            passwordError = passwordError
        )
    }
}
