package com.example.myapplication.ui.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.BuildConfig
import com.example.myapplication.data.local.SessionManager
import com.example.myapplication.data.repository.AoRepository
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(
    application: Application,
    private val repository: AoRepository,
    private val sessionManager: SessionManager,
) : AndroidViewModel(application) {

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _success = MutableStateFlow<String?>(null)
    val success: StateFlow<String?> = _success.asStateFlow()

    private val _loggedIn = MutableStateFlow(false)
    val loggedIn: StateFlow<Boolean> = _loggedIn.asStateFlow()

    private val _autoSyncEnabled = MutableStateFlow(true)
    val autoSyncEnabled: StateFlow<Boolean> = _autoSyncEnabled.asStateFlow()

    private val _lastSyncTimestamp = MutableStateFlow<String?>(null)
    val lastSyncTimestamp: StateFlow<String?> = _lastSyncTimestamp.asStateFlow()

    private val _remoteTeams = MutableStateFlow<List<com.example.myapplication.data.remote.TeamBadge>>(emptyList())
    val remoteTeams: StateFlow<List<com.example.myapplication.data.remote.TeamBadge>> = _remoteTeams.asStateFlow()

    val players: StateFlow<List<Player>> = repository.players
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val matches: StateFlow<List<Match>> = repository.matches
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val asados: StateFlow<List<Asado>> = repository.asados
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Combined snapshot for backward compatibility with screens
    data class SnapshotData(
        val players: List<Player>,
        val matches: List<Match>,
        val asados: List<Asado>
    )
    val snapshot: StateFlow<SnapshotData?> = kotlinx.coroutines.flow.combine(
        repository.players, repository.matches, repository.asados
    ) { p, m, a -> SnapshotData(p, m, a) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    init {
        fetchRemoteTeams()
        viewModelScope.launch {
            sessionManager.loggedIn.collect { value ->
                _loggedIn.value = value
            }
        }
        viewModelScope.launch {
            sessionManager.autoSyncEnabled.collect { value ->
                _autoSyncEnabled.value = value
            }
        }
        viewModelScope.launch {
            _lastSyncTimestamp.value = sessionManager.getLastSyncTimestamp()
        }
    }

    fun setLoggedIn(value: Boolean) {
        viewModelScope.launch {
            sessionManager.setLoggedIn(value)
        }
    }

    fun setAutoSyncEnabled(enabled: Boolean) {
        viewModelScope.launch {
            sessionManager.setAutoSyncEnabled(enabled)
        }
    }

    fun logout() {
        viewModelScope.launch {
            val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(BuildConfig.WEB_CLIENT_ID)
                .requestEmail()
                .build()
            GoogleSignIn.getClient(getApplication(), gso).signOut()
            sessionManager.clearSession()
        }
    }

    private fun fetchRemoteTeams() {
        viewModelScope.launch {
            try {
                _remoteTeams.value = repository.getRemoteTeams()
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error fetching teams", e)
            }
        }
    }

    fun fullSync() {
        _loading.value = true
        _error.value = null
        viewModelScope.launch {
            try {
                // Push local changes first
                val pushResult = repository.pushLocalChanges()
                if (pushResult.isFailure) {
                    _error.value = "Error al subir: ${pushResult.exceptionOrNull()?.message}"
                    return@launch
                }

                // Then pull remote changes
                val since = sessionManager.getLastSyncTimestamp()
                val pullResult = repository.pullRemoteChanges(since)
                if (pullResult.isFailure) {
                    _error.value = "Error al bajar: ${pullResult.exceptionOrNull()?.message}"
                    return@launch
                }

                val serverTime = pullResult.getOrThrow()
                sessionManager.setLastSyncTimestamp(serverTime)
                _lastSyncTimestamp.value = serverTime
                _success.value = "Sincronización completada"
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error en sync", e)
                _error.value = "Error de sincronización: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun refreshDataV2() {
        _error.value = null
        _loading.value = true
        viewModelScope.launch {
            try {
                repository.refreshDataV2()
                val now = java.time.Instant.now().toString()
                sessionManager.setLastSyncTimestamp(now)
                _lastSyncTimestamp.value = now
                _success.value = "Datos descargados correctamente"
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error refreshing V2 data", e)
                _error.value = "Error al bajar datos: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun clearSuccess() {
        _success.value = null
    }

    fun updatePlayerBadge(player: Player, badgeName: String) {
        viewModelScope.launch {
            repository.updatePlayer(player.copy(avatarUrl = badgeName))
        }
    }

    fun addPlayer(name: String) {
        viewModelScope.launch {
            try {
                val newPlayer = Player(
                    id = java.util.UUID.randomUUID().toString(),
                    name = name,
                    createdAt = java.time.LocalDateTime.now().toString(),
                    avatarUrl = null,
                    colorHex = "#00E676",
                    elo = 1500
                )
                repository.addPlayer(newPlayer)
                _success.value = "Jugador añadido: $name"
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error adding player", e)
                _error.value = "Error al añadir jugador: ${e.message}"
            }
        }
    }
}
