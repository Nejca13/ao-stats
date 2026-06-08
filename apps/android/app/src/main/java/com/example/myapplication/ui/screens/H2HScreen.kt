package com.example.myapplication.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.graphics.toColorInt
import com.example.myapplication.ui.components.PlayerAvatar
import com.example.myapplication.ui.theme.PlayerIcons
import com.example.myapplication.ui.viewmodel.MainViewModel

@Composable
fun H2HScreen(viewModel: MainViewModel) {
    val snapshot by viewModel.snapshot.collectAsState()

    snapshot?.let { data ->
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "Head to Head",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            items(data.players) { player ->
                H2HCard(player, data.matches)
            }
        }
    }
}

@Composable
fun H2HCard(player: com.example.myapplication.domain.model.Player, matches: List<com.example.myapplication.domain.model.Match>) {
    val playerColor = try { Color((player.colorHex ?: "#00E676").toColorInt()) } catch (e: Exception) { Color.Green }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            PlayerAvatar(
                playerId = player.id,
                avatarUrl = player.avatarUrl,
                modifier = Modifier.size(56.dp).clip(CircleShape).background(playerColor.copy(alpha = 0.2f))
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(text = player.name, fontWeight = FontWeight.Bold)
                
                // Simplified H2H view
                val playerWins = matches.count { it.winnerId == player.id }
                val playerLosses = matches.count { it.loserId == player.id }
                
                Text(text = "Victorias: $playerWins | Derrotas: $playerLosses", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
