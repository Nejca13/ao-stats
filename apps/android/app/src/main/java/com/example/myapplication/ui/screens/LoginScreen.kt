package com.example.myapplication.ui.screens

import android.app.Activity
import android.content.Intent
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.BuildConfig
import com.example.myapplication.data.local.SessionManager
import com.example.myapplication.ui.components.DownloadConfirmDialog
import com.example.myapplication.ui.theme.AoOrange
import com.example.myapplication.ui.viewmodel.MainViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    sessionManager: SessionManager,
    onLoggedIn: () -> Unit,
    onNavigateToTerms: () -> Unit = {},
    onNavigateToPrivacy: () -> Unit = {},
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var showTermsDialog by remember { mutableStateOf(false) }

    val googleSignInClient: GoogleSignInClient = remember {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(BuildConfig.WEB_CLIENT_ID)
            .requestEmail()
            .build()
        GoogleSignIn.getClient(context, gso)
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account?.idToken
                if (idToken != null) {
                    scope.launch {
                        loading = true
                        error = null
                        try {
                            val client = OkHttpClient()
                            val json = """{"idToken":"$idToken"}"""
                            val body = json.toRequestBody("application/json".toMediaType())
                            val apiRequest = Request.Builder()
                                .url("${com.example.myapplication.BuildConfig.BASE_URL}/api/v1/auth/google")
                                .post(body)
                                .build()

                            val response = withContext(Dispatchers.IO) {
                                client.newCall(apiRequest).execute()
                            }
                            val responseBody = response.body?.string()

                            if (response.isSuccessful && responseBody != null) {
                                val token = extractToken(responseBody)
                                if (token != null) {
                                    sessionManager.setSessionToken(token)
                                    sessionManager.setLoggedIn(true)
                                    onLoggedIn()
                                } else {
                                    error = "Error al obtener token de sesion"
                                }
                            } else {
                                error = "Error del servidor: ${response.code}"
                            }
                        } catch (e: Exception) {
                            Log.e("LoginScreen", "Login error", e)
                            error = "Error: ${e.message}"
                        } finally {
                            loading = false
                        }
                    }
                } else {
                    error = "No se pudo obtener el token de Google"
                }
            } catch (e: ApiException) {
                Log.e("LoginScreen", "Google Sign-In failed", e)
                error = "Error de Google Sign-In: ${e.localizedMessage}"
            }
        } else {
            val googleError = try {
                GoogleSignIn.getSignedInAccountFromIntent(result.data)
                null
            } catch (e: ApiException) {
                e.localizedMessage ?: "Error ${e.statusCode}"
            }
            error = googleError ?: "Inicio de sesion cancelado"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Iniciar Sesion") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "AO Stats",
                style = MaterialTheme.typography.headlineLarge,
                color = AoOrange,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Inicia sesion con tu cuenta de Google\npara sincronizar los datos de tu grupo",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(32.dp))

            if (BuildConfig.WEB_CLIENT_ID.isBlank()) {
                Text(
                    text = "Configuracion pendiente: falta WEB_CLIENT_ID en gradle.properties",
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            Button(
                onClick = {
                    error = null
                    // Check if terms have already been accepted
                    scope.launch {
                        val accepted = sessionManager.hasAcceptedTerms()
                        if (accepted) {
                            launcher.launch(googleSignInClient.signInIntent)
                        } else {
                            showTermsDialog = true
                        }
                    }
                },
                enabled = !loading && BuildConfig.WEB_CLIENT_ID.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AoOrange),
                shape = MaterialTheme.shapes.medium
            ) {
                if (loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        "Iniciar sesion con Google",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }

            error?.let { msg ->
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = msg,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
    }

    // Terms acceptance dialog
    if (showTermsDialog) {
        TermsAcceptanceDialog(
            onAccept = {
                showTermsDialog = false
                scope.launch {
                    sessionManager.setTermsAccepted(true)
                    launcher.launch(googleSignInClient.signInIntent)
                }
            },
            onDecline = { showTermsDialog = false },
            onViewTerms = {
                showTermsDialog = false
                onNavigateToTerms()
            },
            onViewPrivacy = {
                showTermsDialog = false
                onNavigateToPrivacy()
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountScreen(
    viewModel: MainViewModel,
    onLogout: () -> Unit,
    onNavigateToLegal: () -> Unit = {},
) {
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val success by viewModel.success.collectAsState()
    val autoSync by viewModel.autoSyncEnabled.collectAsState()
    val lastSync by viewModel.lastSyncTimestamp.collectAsState()
    val context = LocalContext.current

    var showLogoutConfirm by remember { mutableStateOf(false) }
    var showDownloadConfirm by remember { mutableStateOf(false) }

    LaunchedEffect(error) {
        error?.let {
            Toast.makeText(context, it, Toast.LENGTH_LONG).show()
            viewModel.clearError()
        }
    }

    LaunchedEffect(success) {
        success?.let {
            Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            viewModel.clearSuccess()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cuenta") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = AoOrange
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Sesion iniciada",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Tu cuenta esta vinculada correctamente",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))

            Spacer(modifier = Modifier.height(24.dp))

            // Sync section
            Text(
                text = "Sincronización",
                style = MaterialTheme.typography.titleMedium,
                color = AoOrange,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Los datos se sincronizan automaticamente en segundo plano cuando hay conexion.",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Auto-sync toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Sincronización automática",
                    fontWeight = FontWeight.Medium,
                    fontSize = 14.sp
                )
                Switch(
                    checked = autoSync,
                    onCheckedChange = { viewModel.setAutoSyncEnabled(it) },
                    colors = SwitchDefaults.colors(checkedTrackColor = AoOrange)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (lastSync != null) "Última sincronización: $lastSync"
                       else "Sin sincronizar aún",
                fontSize = 12.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { viewModel.fullSync() },
                enabled = !loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AoOrange),
                shape = MaterialTheme.shapes.medium
            ) {
                Text("Sincronizar ahora", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = { showDownloadConfirm = true },
                enabled = !loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AoOrange),
                border = androidx.compose.foundation.BorderStroke(1.dp, AoOrange),
                shape = MaterialTheme.shapes.medium
            ) {
                Text("Bajar todo del servidor", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))

            HorizontalDivider(color = Color.Gray.copy(alpha = 0.3f))

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(
                onClick = onNavigateToLegal,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.textButtonColors(contentColor = Color.Gray)
            ) {
                Text("Información Legal · Términos · Privacidad", fontSize = 12.sp)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = { showLogoutConfirm = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                shape = MaterialTheme.shapes.medium
            ) {
                Text("Cerrar Sesion", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("Cerrar sesion") },
            text = { Text("Se cerrara la sesion y se eliminaran las cookies guardadas.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutConfirm = false
                        onLogout()
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Cerrar sesion")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) {
                    Text("Cancelar")
                }
            }
        )
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
                viewModel.refreshDataV2()
                showDownloadConfirm = false
            }
        )
    }
}

private fun extractToken(json: String): String? {
    return try {
        val start = json.indexOf("\"token\":\"") + 9
        val end = json.indexOf("\"", start)
        if (start > 8 && end > start) json.substring(start, end) else null
    } catch (_: Exception) {
        null
    }
}
