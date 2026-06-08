package com.example.myapplication.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn

import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.animation.core.animateFloatAsState
import kotlinx.coroutines.launch
import com.example.myapplication.data.remote.CloudinaryManager
import com.example.myapplication.domain.model.*
import com.example.myapplication.ui.components.CustomDialog
import com.example.myapplication.ui.components.PlayerAvatar
import com.example.myapplication.ui.theme.AoOrange
import com.example.myapplication.ui.theme.PlayerIcons
import com.example.myapplication.ui.viewmodel.AsadoViewModel
import com.example.myapplication.ui.viewmodel.MainViewModel


@Composable
fun ActiveAsadoScreen(
    asadoId: String,
    mainViewModel: MainViewModel,
    asadoViewModel: AsadoViewModel,
    onNavigateBack: () -> Unit
) {
    val snapshot by mainViewModel.snapshot.collectAsState()
    val liveMatches by asadoViewModel.liveMatches.collectAsState()
    val context = LocalContext.current
    
    var winnerId by remember { mutableStateOf<String?>(null) }
    var loserId by remember { mutableStateOf<String?>(null) }
    var winnerGoles by remember { mutableStateOf("1") }
    var loserGoles by remember { mutableStateOf("0") }
    var showCamera by remember { mutableStateOf(false) }
    var isUploading by remember { mutableStateOf(false) }
    var showFinalizeDialog by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableIntStateOf(0) }
    var suggestedMatch by remember { mutableStateOf<Set<String>?>(null) }
    val scope = rememberCoroutineScope()

    snapshot?.let { data ->
        val asado = data.asados.find { it.id == asadoId } ?: return@let
        val participatingPlayers = data.players.filter { player ->
            asado.playerIds.contains(player.id)
        }
        val cargarPlayers = suggestedMatch?.let { ids ->
            participatingPlayers.filter { ids.contains(it.id) }
        } ?: participatingPlayers

        if (showCamera) {
            CameraScreen(
                onPhotoCaptured = { uri ->
                    showCamera = false
                    isUploading = true
                    val wId = winnerId
                    val lId = loserId
                    scope.launch {
                        val url = CloudinaryManager.uploadPhoto(uri, "asados")
                        isUploading = false
                        if (url != null && wId != null && lId != null) {
                            asadoViewModel.addMatch(
                                wId,
                                lId,
                                winnerGoles.toIntOrNull() ?: 1,
                                loserGoles.toIntOrNull() ?: 0,
                                url
                            )
                            winnerId = null
                            loserId = null
                            winnerGoles = "1"
                            loserGoles = "0"
                            suggestedMatch = null
                            selectedTab = 2
                            Toast.makeText(context, "Resultado cargado con éxito!", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Error al subir la foto", Toast.LENGTH_SHORT).show()
                        }
                    }
                },
                onClose = { showCamera = false }
            )
        } else {
            Scaffold(
                topBar = {
                    Surface(
                        tonalElevation = 4.dp,
                        color = MaterialTheme.colorScheme.background
                    ) {
                        Column {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .statusBarsPadding()
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Asado Activo",
                                        style = MaterialTheme.typography.titleLarge,
                                        color = AoOrange,
                                        fontWeight = FontWeight.Black
                                    )
                                    Text(
                                        text = asado.date,
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                                    )
                                }
                                IconButton(onClick = { showFinalizeDialog = true }) {
                                    Icon(Icons.Default.Close, contentDescription = "Finalizar Asado", tint = AoOrange)
                                }
                            }
                            
                            TabRow(
                                selectedTabIndex = selectedTab,
                                containerColor = Color.Transparent,
                                contentColor = AoOrange,
                                indicator = { tabPositions ->
                                    TabRowDefaults.SecondaryIndicator(
                                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                                        color = AoOrange
                                    )
                                },
                                divider = {}
                            ) {
                                Tab(
                                    selected = selectedTab == 0,
                                    onClick = { selectedTab = 0 },
                                    text = { Text("Cargar", fontSize = 13.sp, fontWeight = FontWeight.Bold) }
                                )
                                Tab(
                                    selected = selectedTab == 1,
                                    onClick = { selectedTab = 1 },
                                    text = { Text("Partidos (${liveMatches.size})", fontSize = 13.sp, fontWeight = FontWeight.Bold) }
                                )
                                Tab(
                                    selected = selectedTab == 2,
                                    onClick = { selectedTab = 2 },
                                    text = { Text("Torneo", fontSize = 13.sp, fontWeight = FontWeight.Bold) }
                                )
                            }
                        }
                    }
                }
            ) { padding ->
                Box(modifier = Modifier.padding(padding)) {
                    when (selectedTab) {
                        0 -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 16.dp)
                                    .verticalScroll(rememberScrollState())
                            ) {
                                Spacer(modifier = Modifier.height(16.dp))

                                Text(
                                    text = "Seleccionar Ganador:",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                PlayerGrid(
                                    players = cargarPlayers,
                                    selectedId = winnerId,
                                    onPlayerSelected = { winnerId = it },
                                    disabledId = loserId
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                Text(
                                    text = "Seleccionar Perdedor:",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                PlayerGrid(
                                    players = cargarPlayers,
                                    selectedId = loserId,
                                    onPlayerSelected = { loserId = it },
                                    disabledId = winnerId
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                Text(
                                    text = "Resultado (Goles):",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    OutlinedTextField(
                                        value = winnerGoles,
                                        onValueChange = { if (it.length <= 2) winnerGoles = it },
                                        label = { Text("Ganador") },
                                        modifier = Modifier.weight(1f),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        singleLine = true
                                    )
                                    Text("vs", fontWeight = FontWeight.Bold)
                                    OutlinedTextField(
                                        value = loserGoles,
                                        onValueChange = { if (it.length <= 2) loserGoles = it },
                                        label = { Text("Perdedor") },
                                        modifier = Modifier.weight(1f),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        singleLine = true
                                    )
                                }

                                Spacer(modifier = Modifier.height(24.dp))

                                if (isUploading) {
                                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                        CircularProgressIndicator(color = AoOrange)
                                    }
                                } else {
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = {
                                                val wId = winnerId
                                                val lId = loserId
                                                if (wId != null && lId != null) {
                                                    asadoViewModel.addMatch(
                                                        wId,
                                                        lId,
                                                        winnerGoles.toIntOrNull() ?: 1,
                                                        loserGoles.toIntOrNull() ?: 0,
                                                        null
                                                    )
                                                }
                                                winnerId = null
                                                loserId = null
                                                winnerGoles = "1"
                                                loserGoles = "0"
                                                suggestedMatch = null
                                                selectedTab = 2
                                                Toast.makeText(context, "Resultado guardado (sin foto)", Toast.LENGTH_SHORT).show()
                                            },
                                            enabled = winnerId != null && loserId != null,
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(56.dp),
                                            colors = ButtonDefaults.outlinedButtonColors(contentColor = AoOrange),
                                            border = androidx.compose.foundation.BorderStroke(1.dp, AoOrange),
                                            shape = MaterialTheme.shapes.medium
                                        ) {
                                            Text("Sin Foto", fontWeight = FontWeight.Bold)
                                        }

                                        Button(
                                            onClick = { showCamera = true },
                                            enabled = winnerId != null && loserId != null,
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(56.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = AoOrange),
                                            shape = MaterialTheme.shapes.medium
                                        ) {
                                            Text("Con Foto", fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                        1 -> {
                            val playersMap = data.players.associateBy { it.id }
                            
                            if (liveMatches.isEmpty()) {
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Text(
                                        text = "No hay partidos registrados aún.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                                    )
                                }
                            } else {
                                LazyColumn(
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(16.dp),
                                    contentPadding = PaddingValues(bottom = 16.dp)
                                ) {
                                    items(liveMatches.reversed()) { match ->
                                        MatchItem(match = match, playersMap = playersMap)
                                    }
                                }
                            }
                        }
                        2 -> {
                            TournamentTab(
                                asado = asado,
                                allPlayers = data.players,
                                liveMatches = liveMatches,
                                viewModel = asadoViewModel,
                                onQuickRegister = { w, l ->
                                    suggestedMatch = setOf(w, l)
                                    selectedTab = 0
                                }
                            )
                        }
                    }
                }
            }
        }
    } ?: Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = AoOrange)
    }

    if (showFinalizeDialog) {
        CustomDialog(
            onDismissRequest = { showFinalizeDialog = false },
            title = "Finalizar Asado",
            content = {
                Text(
                    text = "¿Estás seguro de que deseas finalizar este asado? Ya no podrás registrar más partidos para esta sesión.",
                    color = Color.White
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        asadoViewModel.cancelNotifications(context)
                        asadoViewModel.finalizeAsado()
                        showFinalizeDialog = false
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AoOrange)
                ) {
                    Text("Finalizar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showFinalizeDialog = false }) {
                    Text("Cancelar", color = Color.Gray)
                }
            }
        )
    }
}

@Composable
fun PlayerGrid(
    players: List<Player>,
    selectedId: String?,
    onPlayerSelected: (String) -> Unit,
    disabledId: String?
) {
    val rows = players.chunked(3)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        rows.forEach { rowPlayers ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rowPlayers.forEach { player ->
                    val isSelected = player.id == selectedId
                    val isDisabled = player.id == disabledId
                    val scale by animateFloatAsState(targetValue = if (isSelected) 1.08f else 1.0f)
                    val opacity by animateFloatAsState(targetValue = if (isDisabled) 0.3f else 1.0f)

                    Box(modifier = Modifier.weight(1f)) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .clip(MaterialTheme.shapes.small)
                                .background(
                                    if (isSelected) AoOrange.copy(alpha = 0.2f)
                                    else Color.Transparent
                                )
                                .border(
                                    width = if (isSelected) 2.dp else 0.dp,
                                    color = if (isSelected) AoOrange else Color.Transparent,
                                    shape = MaterialTheme.shapes.small
                                )
                                .clickable(enabled = !isDisabled) { onPlayerSelected(player.id) }
                                .padding(8.dp)
                                .graphicsLayer {
                                    scaleX = scale
                                    scaleY = scale
                                    alpha = opacity
                                }
                        ) {
                            PlayerAvatar(
                                playerId = player.id,
                                avatarUrl = player.avatarUrl,
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                            )
                            Text(
                                text = player.name,
                                fontSize = 12.sp,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                maxLines = 1,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
                val remaining = 3 - rowPlayers.size
                if (remaining > 0) {
                    repeat(remaining) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TournamentTab(
    asado: Asado,
    allPlayers: List<Player>,
    liveMatches: List<Match>,
    viewModel: AsadoViewModel,
    modifier: Modifier = Modifier,
    onQuickRegister: (String, String) -> Unit
) {
    val config = asado.tournamentConfig ?: TournamentConfig()
    val participants = config.participants
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Participantes Presentes",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Marca quiénes están jugando ahora mismo.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Presence Selector
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val asadoPlayers = allPlayers.filter { asado.playerIds.contains(it.id) }
            asadoPlayers.forEach { player ->
                val isPresent = participants.contains(player.id)
                FilterChip(
                    selected = isPresent,
                    onClick = { viewModel.toggleParticipant(player.id) },
                    label = { Text(player.name) },
                    leadingIcon = {
                        PlayerAvatar(player.id, player.avatarUrl, Modifier.size(18.dp).clip(CircleShape))
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (config.status == TournamentStatus.NOT_STARTED) {
            TournamentLauncher(participants.size, onStart = { viewModel.startTournament(it) })
        } else {
            TournamentStatusView(config, allPlayers, liveMatches, onQuickRegister)
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { viewModel.startTournament(TournamentMode.NONE) },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error.copy(alpha = 0.1f), contentColor = MaterialTheme.colorScheme.error)
            ) {
                Text("Reiniciar Torneo")
            }
        }
    }
}

@Composable
fun TournamentLauncher(participantCount: Int, onStart: (TournamentMode) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = AoOrange.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Modos Sugeridos", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))
            
            if (participantCount == 2) {
                Button(onClick = { onStart(TournamentMode.ONE_VS_ONE) }, modifier = Modifier.fillMaxWidth()) {
                    Text("1 vs 1 (Mejor de 5)")
                }
            } else if (participantCount == 3) {
                Button(onClick = { onStart(TournamentMode.WINNER_STAYS) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Ganador Queda (3 Jugadores)")
                }
            } else if (participantCount >= 4) {
                Button(onClick = { onStart(TournamentMode.LEAGUE) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Armar Liga (Todos vs Todos)")
                }
            } else {
                Text("Necesitas al menos 2 participantes marcados como presentes.", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
fun TournamentStatusView(
    config: TournamentConfig,
    allPlayers: List<Player>,
    liveMatches: List<Match>,
    onQuickRegister: (String, String) -> Unit
) {
    val playersMap = allPlayers.associateBy { it.id }

    when (config.mode) {
        TournamentMode.WINNER_STAYS -> {
            config.winnerStaysConfig?.let { ws ->
                val winner = playersMap[ws.currentWinnerId]
                val challenger = playersMap[ws.nextChallengerId]
                
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("PRÓXIMO ENCUENTRO", style = MaterialTheme.typography.labelLarge, color = AoOrange)
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                            PlayerVSCard(winner)
                            Text(" VS ", fontWeight = FontWeight.Black)
                            PlayerVSCard(challenger)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { onQuickRegister(ws.currentWinnerId!!, ws.nextChallengerId!!) }) {
                            Text("Cargar Resultado")
                        }
                    }
                }
                
                if (ws.queue.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("En espera: " + ws.queue.map { playersMap[it]?.name ?: "" }.joinToString(", "))
                }
            }
        }
        TournamentMode.ONE_VS_ONE -> {
            config.oneVsOneConfig?.let { ovs ->
                val p1 = playersMap[ovs.player1Id]
                val p2 = playersMap[ovs.player2Id]

                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("1 vs 1 — Mejor de ${ovs.targetWins * 2 - 1}", style = MaterialTheme.typography.titleMedium, color = AoOrange)
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                            PlayerVSCard(p1)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("${ovs.player1Wins}", fontWeight = FontWeight.Black, fontSize = 28.sp)
                            Text("  -  ", fontWeight = FontWeight.Black, fontSize = 20.sp)
                            Text("${ovs.player2Wins}", fontWeight = FontWeight.Black, fontSize = 28.sp)
                            Spacer(modifier = Modifier.width(12.dp))
                            PlayerVSCard(p2)
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        val isFinished = ovs.player1Wins >= ovs.targetWins || ovs.player2Wins >= ovs.targetWins
                        if (isFinished) {
                            val winner = if (ovs.player1Wins >= ovs.targetWins) p1 else p2
                            Text("¡${winner?.name} GANA LA SERIE!", color = AoOrange, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        } else {
                            Button(onClick = { onQuickRegister(ovs.player1Id, ovs.player2Id) }) {
                                Text("Jugar Siguiente")
                            }
                        }
                    }
                }
            }
        }
        TournamentMode.LEAGUE -> {
            val table = com.example.myapplication.domain.logic.TournamentEngine.calculateLeagueTable(
                config.participants, liveMatches, emptyList()
            )
            
            Text("Tabla de la Liga", fontWeight = FontWeight.Bold)
            table.forEach { rank ->
                val p = playersMap[rank.playerId]
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("#${rank.position + 1}", modifier = Modifier.width(30.dp))
                    Text(p?.name ?: "???", modifier = Modifier.weight(1f))
                    Text("${rank.points} pts", fontWeight = FontWeight.Bold)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            val nextMatch = config.leagueConfig?.fixtures?.find { it.status == MatchStatus.PENDING }
            if (nextMatch != null) {
                val p1 = playersMap[nextMatch.player1Id]
                val p2 = playersMap[nextMatch.player2Id]
                
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("SIGUIENTE PARTIDO", color = AoOrange)
                        Text("${p1?.name} vs ${p2?.name}", fontWeight = FontWeight.Bold)
                        Button(onClick = { onQuickRegister(nextMatch.player1Id, nextMatch.player2Id) }) {
                            Text("Jugar")
                        }
                    }
                }
            }
        }
        else -> {}
    }
}

@Composable
fun PlayerVSCard(player: Player?) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        PlayerAvatar(player?.id ?: "", player?.avatarUrl, Modifier.size(60.dp).clip(CircleShape))
        Text(player?.name ?: "???", fontWeight = FontWeight.Bold)
    }
}
