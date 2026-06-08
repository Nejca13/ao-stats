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
import com.example.myapplication.domain.model.Player
import com.example.myapplication.domain.model.Snapshot
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

    val snapshot: StateFlow<Snapshot?> = repository.snapshot
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _remoteTeams = MutableStateFlow<List<com.example.myapplication.data.remote.TeamBadge>>(emptyList())
    val remoteTeams: StateFlow<List<com.example.myapplication.data.remote.TeamBadge>> = _remoteTeams.asStateFlow()

    init {
        fetchRemoteTeams()
        viewModelScope.launch {
            sessionManager.loggedIn.collect { value ->
                _loggedIn.value = value
            }
        }
    }

    fun setLoggedIn(value: Boolean) {
        viewModelScope.launch {
            sessionManager.setLoggedIn(value)
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

    fun refreshData() {
        _error.value = null
        _loading.value = true
        viewModelScope.launch {
            try {
                repository.refreshData()
                _success.value = "Datos descargados correctamente"
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error refreshing data", e)
                _error.value = "Error al bajar datos: ${e.message}"
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
                _success.value = "Datos (V2) descargados correctamente"
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error refreshing V2 data", e)
                _error.value = "Error al bajar datos V2: ${e.message}"
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

    fun uploadData() {
        _loading.value = true
        viewModelScope.launch {
            try {
                snapshot.value?.let {
                    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
                    sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
                    val now = sdf.format(java.util.Date())

                    val updatedSnapshot = it.copy(
                        metadata = it.metadata.copy(exportedAt = now)
                    )
                    repository.syncSnapshot(updatedSnapshot)
                    _success.value = "Datos subidos correctamente"
                }
            } catch (e: Exception) {
                Log.e("MainViewModel", "Error uploading data", e)
                _error.value = "Error al subir datos: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
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
