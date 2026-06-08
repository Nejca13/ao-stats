package com.example.myapplication.ui.screens

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Player
import com.example.myapplication.ui.theme.AoOrange
import com.example.myapplication.ui.viewmodel.AsadoViewModel
import com.example.myapplication.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AsadoScreen(
    mainViewModel: MainViewModel, 
    asadoViewModel: AsadoViewModel,
    onAsadoClick: (String) -> Unit,
    onActiveAsadoClick: (String) -> Unit
) {
    val snapshot by mainViewModel.snapshot.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current
    var pendingNewAsado by remember { mutableStateOf<Triple<String, List<String>, String?>?>(null) }

    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        pendingNewAsado?.let { (date, players, comment) ->
            asadoViewModel.startAsado(context, date, players, comment)
            pendingNewAsado = null
        }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showDialog = true },
                containerColor = AoOrange,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Nuevo Asado")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                text = "Historial de Asados",
                style = MaterialTheme.typography.headlineMedium,
                color = AoOrange,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 24.dp)
            )

            snapshot?.let { data ->
                val sortedAsados = data.asados.sortedByDescending { it.date }
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(sortedAsados) { asado ->
                        AsadoHistoryItem(
                            asado = asado,
                            isActive = asado.isActive == true,
                            onClick = {
                                if (asado.isActive == true) {
                                    onActiveAsadoClick(asado.id)
                                } else {
                                    onAsadoClick(asado.id)
                                }
                            }
                        )
                    }
                }
            } ?: Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AoOrange)
            }
        }
    }

    if (showDialog) {
        NewAsadoDialog(
            players = snapshot?.players ?: emptyList(),
            onDismiss = { showDialog = false },
            onConfirm = { date, selectedPlayers, comment ->
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    pendingNewAsado = Triple(date, selectedPlayers, comment)
                    notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                } else {
                    asadoViewModel.startAsado(context, date, selectedPlayers, comment)
                }
                showDialog = false
            }
        )
    }
}

@Composable
fun AsadoHistoryItem(asado: Asado, isActive: Boolean = false, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .border(
                width = if (isActive) 2.dp else 0.dp,
                color = if (isActive) AoOrange else Color.Transparent,
                shape = MaterialTheme.shapes.medium
            ),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = asado.date,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                if (isActive) {
                    Surface(
                        color = AoOrange,
                        shape = CircleShape,
                        modifier = Modifier.padding(start = 8.dp)
                    ) {
                        Text(
                            text = "ACTIVO",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                }
            }
            Text(
                text = "${asado.playerIds.size} jugadores. ${asado.comment ?: ""}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewAsadoDialog(
    players: List<Player>,
    onDismiss: () -> Unit,
    onConfirm: (String, List<String>, String?) -> Unit
) {
    var date by remember { 
        mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) 
    }
    var comment by remember { mutableStateOf("") }
    val selectedPlayers = remember { mutableStateListOf<String>() }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1C1E)),
            shape = MaterialTheme.shapes.extraLarge
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Nuevo Asado",
                    style = MaterialTheme.typography.headlineSmall,
                    color = AoOrange,
                    fontWeight = FontWeight.Bold
                )

                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Fecha (YYYY-MM-DD)", color = Color.Gray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AoOrange,
                        focusedLabelColor = AoOrange,
                        unfocusedBorderColor = Color.Gray,
                        unfocusedLabelColor = Color.Gray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Text(
                    text = "Jugadores asistentes:",
                    style = MaterialTheme.typography.titleMedium,
                    color = AoOrange,
                    fontWeight = FontWeight.Bold
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .background(Color(0xFF2C2C2E), MaterialTheme.shapes.medium)
                        .padding(8.dp)
                ) {
                    LazyColumn {
                        items(players) { player ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Checkbox(
                                    checked = selectedPlayers.contains(player.id),
                                    onCheckedChange = { checked ->
                                        if (checked) selectedPlayers.add(player.id)
                                        else selectedPlayers.remove(player.id)
                                    },
                                    colors = CheckboxDefaults.colors(checkedColor = AoOrange)
                                )
                                Text(text = player.name, color = Color.White)
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    placeholder = { Text("Comentario (opcional)", color = Color.Gray) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AoOrange,
                        focusedLabelColor = AoOrange,
                        unfocusedBorderColor = Color.Gray,
                        unfocusedLabelColor = Color.Gray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancelar", color = Color.White)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onConfirm(date, selectedPlayers.toList(), comment.takeIf { it.isNotBlank() }) },
                        enabled = selectedPlayers.isNotEmpty(),
                        colors = ButtonDefaults.buttonColors(containerColor = AoOrange),
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Text("Comenzar", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
