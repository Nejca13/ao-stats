package com.example.myapplication.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.core.graphics.toColorInt
import com.example.myapplication.domain.logic.RankingEngine
import com.example.myapplication.domain.model.Player
import com.example.myapplication.ui.components.DownloadConfirmDialog
import com.example.myapplication.ui.components.UploadConfirmDialog
import com.example.myapplication.ui.components.PlayerAvatar
import com.example.myapplication.ui.theme.AoOrange
import com.example.myapplication.ui.theme.PlayerIcons
import com.example.myapplication.ui.viewmodel.MainViewModel

@Composable
fun GlobalScreen(viewModel: MainViewModel) {
    val snapshot by viewModel.snapshot.collectAsState()
    val context = androidx.compose.ui.platform.LocalContext.current
    val error by viewModel.error.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val success by viewModel.success.collectAsState()

    var showDownloadConfirm by remember { mutableStateOf(false) }
    var showUploadConfirm by remember { mutableStateOf(false) }
    var uploadPassword by remember { mutableStateOf("") }
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

    snapshot?.let { data ->
        val processedStats = remember(data.players, data.asados, data.matches) {
            RankingEngine.processAllStats(data.players, data.asados, data.matches)
        }
        val allStats = remember(processedStats) { processedStats.associateBy { it.playerId } }
        val sortedByElo = remember(processedStats) { processedStats.sortedByDescending { it.elo } }
        val mvpHistorical = remember(processedStats) { processedStats.maxByOrNull { it.mvpCount } }
        
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "AO&FC",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Black,
                        color = AoOrange
                    )
                    Text(
                        text = "by Nejca",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = AoOrange
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { showDownloadConfirm = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                    ) {
                        Icon(Icons.Default.KeyboardArrowDown, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Bajar Datos")
                    }
                    Button(
                        onClick = { showUploadConfirm = true },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.KeyboardArrowUp, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Subir Datos")
                    }
                }
            }

            item {
                Text(
                    text = "🏆 MVP Histórico",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                mvpHistorical?.let { stats ->
                    val player = data.players.find { it.id == stats.playerId }
                    if (player != null) {
                        MvpCard(player, stats)
                    }
                }
            }

            item {
                Text(
                    text = "Ranking por ELO",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
                )
            }

            itemsIndexed(sortedByElo) { index, stats ->
                val player = data.players.find { it.id == stats.playerId }
                if (player != null) {
                    PlayerCard(index + 1, player, stats)
                }
            }
        }
    } ?: Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
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

    if (showUploadConfirm) {
        UploadConfirmDialog(
            onDismissRequest = {
                showUploadConfirm = false
                uploadPassword = ""
                passwordError = false
            },
            onConfirm = { password ->
                if (password == "mumbongopro") {
                    viewModel.fullSync()
                    showUploadConfirm = false
                    uploadPassword = ""
                } else {
                    passwordError = true
                }
            },
            passwordError = passwordError
        )
    }
}

@Composable
fun MvpCard(player: Player, stats: com.example.myapplication.domain.logic.PlayerStats) {
    val playerColor = try { Color((player.colorHex ?: "#00E676").toColorInt()) } catch (e: Exception) { Color.Green }
    
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = playerColor.copy(alpha = 0.2f))
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            PlayerAvatar(
                playerId = player.id,
                avatarUrl = player.avatarUrl,
                modifier = Modifier.size(64.dp).clip(CircleShape).background(playerColor.copy(alpha = 0.4f))
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(text = player.name, fontWeight = FontWeight.Black, fontSize = 24.sp)
                Text(text = "MVPs: ${stats.mvpCount} | ELO: ${stats.elo}", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
fun PlayerCard(rank: Int, player: Player, stats: com.example.myapplication.domain.logic.PlayerStats) {
    val playerColor = try { Color((player.colorHex ?: "#00E676").toColorInt()) } catch (e: Exception) { Color.Green }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "#$rank", fontWeight = FontWeight.Bold, modifier = Modifier.width(40.dp))
            PlayerAvatar(
                playerId = player.id,
                avatarUrl = player.avatarUrl,
                modifier = Modifier.size(40.dp).clip(CircleShape).background(playerColor.copy(alpha = 0.2f))
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = player.name, fontWeight = FontWeight.Bold)
                Text(
                    text = "Record: ${stats.wins}W - ${stats.losses}L | WinRate: ${stats.winRate}%",
                    fontSize = 12.sp
                )
            }
            Text(text = "${stats.elo}", fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
        }
    }
}
