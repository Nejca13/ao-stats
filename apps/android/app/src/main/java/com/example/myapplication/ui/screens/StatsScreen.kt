package com.example.myapplication.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.unit.sp
import com.example.myapplication.domain.logic.AsadoRanking
import com.example.myapplication.domain.logic.PlayerStats
import com.example.myapplication.domain.logic.RankingEngine
import com.example.myapplication.domain.model.Player
import com.example.myapplication.ui.components.PlayerAvatar
import com.example.myapplication.ui.theme.AoOrange
import com.example.myapplication.ui.theme.PlayerIcons
import com.example.myapplication.ui.viewmodel.MainViewModel
import java.util.Locale

@Composable
fun StatsScreen(viewModel: MainViewModel) {
    val snapshot by viewModel.snapshot.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Header
        Text(
            text = "Estadísticas",
            style = MaterialTheme.typography.headlineMedium,
            color = AoOrange,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Tab row
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            val tabs = listOf("Global", "Por AO", "Cara a Cara")
            tabs.forEachIndexed { index, title ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clickable { selectedTab = index }
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = title,
                        color = if (selectedTab == index) AoOrange else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                        fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                    )
                    if (selectedTab == index) {
                        Box(modifier = Modifier.width(40.dp).height(2.dp).background(AoOrange))
                    } else {
                        Spacer(modifier = Modifier.height(2.dp))
                    }
                }
            }
        }

        snapshot?.let { data ->
            when (selectedTab) {
                0 -> GlobalStatsView(data.players, data.asados, data.matches)
                1 -> PerAsadoView(data.players, data.asados, data.matches)
                2 -> H2HView(data.players, data.asados, data.matches)
            }
        } ?: Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = AoOrange)
        }
    }
}

@Composable
fun GlobalStatsView(players: List<Player>, asados: List<com.example.myapplication.domain.model.Asado>, matches: List<com.example.myapplication.domain.model.Match>) {
    val processedStats = remember(players, asados, matches) {
        RankingEngine.processAllStats(players, asados, matches)
    }

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 16.dp)
    ) {
        items(processedStats) { stats ->
            val player = players.find { it.id == stats.playerId }
            if (player != null) {
                StatsPlayerCard(player, stats)
            }
        }
    }
}

@Composable
fun PerAsadoView(players: List<Player>, asados: List<com.example.myapplication.domain.model.Asado>, matches: List<com.example.myapplication.domain.model.Match>) {
    val perAsadoRankings = remember(asados, matches) {
        RankingEngine.calculatePerAsadoRankings(asados, matches)
    }

    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 16.dp)
    ) {
        items(perAsadoRankings) { ranking ->
            AsadoRankingCard(ranking, players)
        }
    }
}

@Composable
fun H2HView(players: List<Player>, asados: List<com.example.myapplication.domain.model.Asado>, matches: List<com.example.myapplication.domain.model.Match>) {
    val processedStats = remember(players, asados, matches) {
        RankingEngine.processAllStats(players, asados, matches)
    }
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 16.dp)
    ) {
        items(processedStats) { stats ->
            val player = players.find { it.id == stats.playerId }
            if (player != null) {
                H2HDetailCard(player, stats, players)
            }
        }
    }
}

@Composable
fun AsadoRankingCard(ranking: AsadoRanking, players: List<Player>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = ranking.date,
                style = MaterialTheme.typography.titleMedium,
                color = AoOrange,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))
            
            ranking.rankings.forEach { rank ->
                val player = players.find { it.id == rank.playerId }
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "#${rank.position + 1}", modifier = Modifier.width(32.dp), fontWeight = FontWeight.Bold)
                    PlayerAvatar(
                        playerId = rank.playerId,
                        avatarUrl = player?.avatarUrl,
                        modifier = Modifier.size(24.dp).clip(CircleShape)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = player?.name ?: "???", modifier = Modifier.weight(1f))
                    Text(text = "${rank.wins}W-${rank.losses}L", modifier = Modifier.padding(horizontal = 8.dp), fontSize = 12.sp)
                    Text(text = "${rank.points} Pts", fontWeight = FontWeight.ExtraBold, color = AoOrange)
                }
            }
        }
    }
}

@Composable
fun H2HDetailCard(player: Player, stats: PlayerStats, allPlayers: List<Player>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PlayerAvatar(
                    playerId = player.id,
                    avatarUrl = player.avatarUrl,
                    modifier = Modifier.size(40.dp).clip(CircleShape).background(AoOrange.copy(alpha = 0.2f))
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(text = player.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                H2HItem(
                    label = "Mejor Víctima", 
                    opponentId = stats.bestVictimId, 
                    players = allPlayers,
                    color = Color.Green
                )
                H2HItem(
                    label = "Némesis", 
                    opponentId = stats.nemesisId, 
                    players = allPlayers,
                    color = Color.Red
                )
            }
        }
    }
}

@Composable
fun H2HItem(label: String, opponentId: String?, players: List<Player>, color: Color) {
    val opponent = players.find { it.id == opponentId }
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
        if (opponent != null) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                PlayerAvatar(
                    playerId = opponent.id,
                    avatarUrl = opponent.avatarUrl,
                    modifier = Modifier.size(20.dp).clip(CircleShape)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(text = opponent.name, fontWeight = FontWeight.Bold, color = color.copy(alpha = 0.8f))
            }
        } else {
            Text(text = "---", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

@Composable
fun StatsPlayerCard(player: Player, stats: PlayerStats) {
    val elo = stats.elo
    val (rankName, rankIcon) = when {
        elo >= 1700 -> "Legendary" to "💎"
        elo >= 1600 -> "Epic" to "🔮"
        elo >= 1500 -> "Gold" to "🥇"
        elo >= 1400 -> "Silver" to "🥈"
        else -> "Bronze" to "🥉"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PlayerAvatar(
                    playerId = stats.playerId,
                    avatarUrl = player.avatarUrl,
                    modifier = Modifier.size(48.dp).clip(CircleShape).background(AoOrange.copy(alpha = 0.2f))
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = player.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        if (stats.mvpCount > 0) {
                            Text(text = " 🏆", fontSize = 14.sp)
                        }
                    }
                    Text(text = "$rankName $rankIcon", color = AoOrange, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "${stats.totalPoints} Pts", fontWeight = FontWeight.Bold, color = AoOrange, fontSize = 18.sp)
                    val avgPointsFormatted = String.format(Locale.US, "%.1f", stats.averagePoints)
                    Text(
                        text = "Avg: $avgPointsFormatted", 
                        fontSize = 12.sp, 
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                StatItem(label = "Récord", value = "${stats.wins}-${stats.losses}")
                StatItem(label = "Win Rate", value = "${stats.winRate.toInt()}%")
                StatItem(label = "Asados", value = "${stats.asadosPlayed}")
                StatItem(label = "ELO", value = "$elo")
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                StatItem(label = "Goles F.", value = "${stats.goalsScored}")
                StatItem(label = "Goles C.", value = "${stats.goalsConceded}")
                StatItem(label = "Dif. Goles", value = "${stats.goalDiff}")
                val avgGoalsFormatted = String.format(Locale.US, "%.1f", stats.avgGoalsScored)
                StatItem(label = "Prom. Goles", value = avgGoalsFormatted)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Progress bar
            LinearProgressIndicator(
                progress = { stats.winRate.toFloat() / 100f },
                modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                color = AoOrange,
                trackColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f)
            )
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(text = label, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
    }
}
