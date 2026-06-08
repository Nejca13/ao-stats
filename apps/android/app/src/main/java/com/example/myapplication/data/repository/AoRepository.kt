package com.example.myapplication.data.repository

import com.example.myapplication.data.local.AppDatabase
import com.example.myapplication.data.mapper.toDomain
import com.example.myapplication.data.mapper.toEntity
import com.example.myapplication.data.remote.AoApiService
import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import com.example.myapplication.domain.model.Snapshot
import com.example.myapplication.domain.model.SnapshotMetadata
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map

class AoRepository(
    private val db: AppDatabase,
    private val api: AoApiService
) {
    val players: Flow<List<Player>> = db.playerDao().getAllPlayers().map { entities ->
        entities.map { it.toDomain() }
    }

    val matches: Flow<List<Match>> = db.matchDao().getAllMatches().map { entities ->
        entities.map { it.toDomain() }
    }

    val asados: Flow<List<Asado>> = db.asadoDao().getAllAsados().map { entities ->
        entities.map { it.toDomain() }
    }

    val activeAsado: Flow<Asado?> = db.asadoDao().getActiveAsado().map { it?.toDomain() }

    fun getMatchesByAsadoId(asadoId: String): Flow<List<Match>> =
        db.matchDao().getMatchesByAsadoId(asadoId).map { entities ->
            entities.map { it.toDomain() }
        }

    val snapshot: Flow<Snapshot> = combine(players, matches, asados) { p, m, a ->
        Snapshot(p, a, m, SnapshotMetadata("1.0.0"))
    }

    suspend fun refreshData() {
        val remoteSnapshot = api.getSnapshot()
        
        db.playerDao().deleteAllPlayers()
        db.matchDao().deleteAllMatches()
        db.asadoDao().deleteAllAsados()

        db.playerDao().insertPlayers(remoteSnapshot.players.map { it.toEntity() })
        db.matchDao().insertMatches(remoteSnapshot.matches.map { it.toEntity() })
        db.asadoDao().insertAsados(remoteSnapshot.asados.map { it.toEntity() })
    }

    suspend fun syncSnapshot(snapshot: Snapshot) {
        api.postSnapshot(snapshot)
    }

    suspend fun insertAsado(asado: Asado) {
        db.asadoDao().insertAsados(listOf(asado.toEntity()))
    }

    suspend fun updateAsado(asado: Asado) {
        db.asadoDao().updateAsado(asado.toEntity())
    }

    suspend fun insertMatch(match: Match) {
        db.matchDao().insertMatches(listOf(match.toEntity()))
    }

    suspend fun updatePlayer(player: Player) {
        db.playerDao().updatePlayer(player.toEntity())
    }

    suspend fun addPlayer(player: Player) {
        db.playerDao().insertPlayers(listOf(player.toEntity()))
    }

    suspend fun refreshDataV2() {
        val playersResponse = api.getPlayers()
        val asadosResponse = api.getAsados()
        val matchesResponse = api.getMatches()

        db.playerDao().deleteAllPlayers()
        db.matchDao().deleteAllMatches()
        db.asadoDao().deleteAllAsados()

        db.playerDao().insertPlayers(playersResponse.players.map { it.toEntity() })
        db.asadoDao().insertAsados(asadosResponse.asados.map { it.toEntity() })
        db.matchDao().insertMatches(matchesResponse.matches.map { it.toEntity() })
    }

    suspend fun getRemoteTeams() = try {
        val response = api.getTeams()
        response.teams.map { team ->
            val finalUrl = if (team.logoUrl.startsWith("http")) {
                team.logoUrl
            } else {
                "https://nejca.com.ar${team.logoUrl}"
            }
            team.copy(logoUrl = finalUrl)
        }
    } catch (e: Exception) {
        emptyList()
    }
}
