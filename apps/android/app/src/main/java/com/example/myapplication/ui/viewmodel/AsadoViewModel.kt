package com.example.myapplication.ui.viewmodel

import android.app.NotificationManager
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.notifications.NotificationHelper
import com.example.myapplication.data.notifications.NotificationWorker
import com.example.myapplication.data.repository.AoRepository
import com.example.myapplication.domain.logic.TournamentEngine
import com.example.myapplication.domain.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class AsadoViewModel(private val repository: AoRepository) : ViewModel() {

    private val _liveMatches = MutableStateFlow<List<Match>>(emptyList())
    val liveMatches: StateFlow<List<Match>> = _liveMatches.asStateFlow()

    private val _currentAsadoId = MutableStateFlow<String?>(null)
    val currentAsadoId: StateFlow<String?> = _currentAsadoId.asStateFlow()

    private val _activeAsado = repository.activeAsado.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = null
    )
    val activeAsado: StateFlow<Asado?> = _activeAsado

    init {
        viewModelScope.launch {
            _activeAsado.collect { asado ->
                _currentAsadoId.value = asado?.id
            }
        }
        viewModelScope.launch {
            _activeAsado
                .flatMapLatest { asado ->
                    if (asado != null) {
                        repository.getMatchesByAsadoId(asado.id)
                    } else {
                        flowOf(emptyList())
                    }
                }
                .collect { filteredMatches ->
                    _liveMatches.value = filteredMatches
                }
        }
    }

    fun startAsado(context: Context, date: String, playerIds: List<String>, comment: String?) {
        val asadoId = UUID.randomUUID().toString()
        val newAsado = Asado(
            id = asadoId,
            date = date,
            playerIds = playerIds,
            comment = comment,
            isActive = true,
            tournamentConfig = TournamentConfig(participants = playerIds)
        )
        
        viewModelScope.launch {
            repository.insertAsado(newAsado)
            NotificationHelper.schedulePeriodicNotification(context)
        }
    }

    fun toggleParticipant(playerId: String) {
        val current = _activeAsado.value ?: return
        val config = current.tournamentConfig ?: TournamentConfig()
        val participants = config.participants.toMutableList()
        
        if (participants.contains(playerId)) {
            participants.remove(playerId)
        } else {
            participants.add(playerId)
        }
        
        viewModelScope.launch {
            repository.updateAsado(current.copy(
                tournamentConfig = config.copy(participants = participants)
            ))
        }
    }

    fun startTournament(mode: TournamentMode) {
        val current = _activeAsado.value ?: return
        val participants = current.tournamentConfig?.participants ?: emptyList()
        if (participants.size < 2) return

        val newConfig = when (mode) {
            TournamentMode.WINNER_STAYS -> TournamentConfig(
                mode = mode,
                status = TournamentStatus.IN_PROGRESS,
                participants = participants,
                winnerStaysConfig = TournamentEngine.generateInitialWinnerStays(participants)
            )
            TournamentMode.LEAGUE -> TournamentConfig(
                mode = mode,
                status = TournamentStatus.IN_PROGRESS,
                participants = participants,
                leagueConfig = TournamentEngine.generateInitialLeague(participants)
            )
            TournamentMode.ONE_VS_ONE -> TournamentConfig(
                mode = mode,
                status = TournamentStatus.IN_PROGRESS,
                participants = participants,
                oneVsOneConfig = TournamentEngine.generateInitialOneVsOne(participants)
            )
            else -> TournamentConfig(participants = participants)
        }

        viewModelScope.launch {
            repository.updateAsado(current.copy(tournamentConfig = newConfig))
        }
    }

    fun finalizeAsado() {
        val asadoId = _currentAsadoId.value ?: return
        viewModelScope.launch {
            _activeAsado.value?.let { current ->
                if (current.id == asadoId) {
                    repository.updateAsado(current.copy(isActive = false))
                }
            }
        }
    }

    fun cancelNotifications(context: Context) {
        NotificationHelper.cancelPeriodicNotification(context)
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(NotificationWorker.NOTIFICATION_ID)
    }

    fun addMatch(winnerId: String, loserId: String, winnerGoles: Int, loserGoles: Int, photoUrl: String?) {
        val asadoId = _currentAsadoId.value ?: return
        val currentAsado = _activeAsado.value ?: return
        
        val newMatch = Match(
            id = UUID.randomUUID().toString(),
            asadoId = asadoId,
            winnerId = winnerId,
            loserId = loserId,
            winnerGoles = winnerGoles,
            loserGoles = loserGoles,
            photoUrl = photoUrl,
            createdAt = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
        )
        
        viewModelScope.launch {
            repository.insertMatch(newMatch)
            
            // Update Tournament State
            val config = currentAsado.tournamentConfig
            if (config != null && config.status == TournamentStatus.IN_PROGRESS) {
                val updatedConfig = when (config.mode) {
                    TournamentMode.WINNER_STAYS -> {
                        config.winnerStaysConfig?.let { ws ->
                            config.copy(winnerStaysConfig = TournamentEngine.rotateWinnerStays(
                                ws, winnerId, loserId, config.participants
                            ))
                        } ?: config
                    }
                    TournamentMode.LEAGUE -> {
                        val updatedFixtures = config.leagueConfig?.fixtures?.map { f ->
                            if ((f.player1Id == winnerId && f.player2Id == loserId) ||
                                (f.player1Id == loserId && f.player2Id == winnerId)) {
                                f.copy(status = MatchStatus.COMPLETED)
                            } else f
                        }
                        config.copy(leagueConfig = LeagueConfig(updatedFixtures ?: emptyList()))
                    }
                    TournamentMode.ONE_VS_ONE -> {
                        config.oneVsOneConfig?.let { ovs ->
                            val updated = if (winnerId == ovs.player1Id) {
                                ovs.copy(player1Wins = ovs.player1Wins + 1)
                            } else {
                                ovs.copy(player2Wins = ovs.player2Wins + 1)
                            }
                            val finished = updated.player1Wins >= updated.targetWins || updated.player2Wins >= updated.targetWins
                            config.copy(
                                oneVsOneConfig = updated,
                                status = if (finished) TournamentStatus.FINISHED else config.status
                            )
                        } ?: config
                    }
                    else -> config
                }
                repository.updateAsado(currentAsado.copy(tournamentConfig = updatedConfig))
            }
        }
    }
}
