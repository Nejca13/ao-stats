package com.example.myapplication.data.repository

import com.example.myapplication.data.local.AppDatabase
import com.example.myapplication.data.mapper.toDomain
import com.example.myapplication.data.mapper.toEntity
import com.example.myapplication.data.mapper.toSyncedEntity
import com.example.myapplication.BuildConfig
import com.example.myapplication.data.remote.AoApiService
import com.example.myapplication.data.remote.SyncRequest
import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.Instant

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

    suspend fun pushLocalChanges(): Result<String> {
        return try {
            val now = Instant.now().toString()

            val pendingPlayers = db.playerDao().getPendingChanges().map { it.toDomain() }
            val pendingAsados = db.asadoDao().getPendingChanges().map { it.toDomain() }
            val pendingMatches = db.matchDao().getPendingChanges().map { it.toDomain() }

            if (pendingPlayers.isEmpty() && pendingAsados.isEmpty() && pendingMatches.isEmpty()) {
                return Result.success("Sin cambios locales para subir")
            }

            val body = SyncRequest(
                players = pendingPlayers.ifEmpty { null },
                asados = pendingAsados.ifEmpty { null },
                matches = pendingMatches.ifEmpty { null }
            )

            val response = api.postSync(body)
            val serverTime = response.serverTime ?: now

            // Mark pushed items as synced
            markSynced(serverTime)

            val counts = response.upserted
            val msg = buildString {
                append("Subido: ")
                append("${counts?.players ?: 0} jugadores, ")
                append("${counts?.asados ?: 0} asados, ")
                append("${counts?.matches ?: 0} partidos")
            }
            Result.success(msg)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun pullRemoteChanges(since: String?): Result<String> {
        return try {
            val response = api.getSync(since)
            val serverTime = response.serverTime ?: Instant.now().toString()

            if (response.players.isNotEmpty()) {
                val entities = response.players.map { p ->
                    p.toEntity().copy(updatedAt = serverTime, syncedAt = serverTime)
                }
                db.playerDao().insertPlayers(entities)
            }
            if (response.asados.isNotEmpty()) {
                val entities = response.asados.map { a ->
                    a.toEntity().copy(updatedAt = serverTime, syncedAt = serverTime)
                }
                db.asadoDao().insertAsados(entities)
            }
            if (response.matches.isNotEmpty()) {
                val entities = response.matches.map { m ->
                    m.toEntity().copy(updatedAt = serverTime, syncedAt = serverTime)
                }
                db.matchDao().insertMatches(entities)
            }

            Result.success(serverTime)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun markSynced(serverTime: String) {
        // Mark all pending as synced on the server time
        val now = Instant.now().toString()
        val pendingPlayers = db.playerDao().getPendingChanges()
        if (pendingPlayers.isNotEmpty()) {
            db.playerDao().insertPlayers(pendingPlayers.map { it.copy(syncedAt = serverTime, updatedAt = now) })
        }
        val pendingAsados = db.asadoDao().getPendingChanges()
        if (pendingAsados.isNotEmpty()) {
            db.asadoDao().insertAsados(pendingAsados.map { it.copy(syncedAt = serverTime, updatedAt = now) })
        }
        val pendingMatches = db.matchDao().getPendingChanges()
        if (pendingMatches.isNotEmpty()) {
            db.matchDao().insertMatches(pendingMatches.map { it.copy(syncedAt = serverTime, updatedAt = now) })
        }
    }

    // Full overwrite from server (for manual "download all")
    suspend fun refreshDataV2() {
        val playersResponse = api.getPlayers()
        val asadosResponse = api.getAsados()
        val matchesResponse = api.getMatches()

        db.playerDao().deleteAllPlayers()
        db.matchDao().deleteAllMatches()
        db.asadoDao().deleteAllAsados()

        val now = Instant.now().toString()
        db.playerDao().insertPlayers(playersResponse.players.map { p ->
            p.toEntity().copy(updatedAt = now, syncedAt = now)
        })
        db.asadoDao().insertAsados(asadosResponse.asados.map { a ->
            a.toEntity().copy(updatedAt = now, syncedAt = now)
        })
        db.matchDao().insertMatches(matchesResponse.matches.map { m ->
            m.toEntity().copy(updatedAt = now, syncedAt = now)
        })
    }

    suspend fun insertAsado(asado: Asado) {
        val now = Instant.now().toString()
        db.asadoDao().insertAsados(listOf(asado.toSyncedEntity(now)))
    }

    suspend fun updateAsado(asado: Asado) {
        val now = Instant.now().toString()
        db.asadoDao().updateAsado(asado.toSyncedEntity(now))
    }

    suspend fun insertMatch(match: Match) {
        val now = Instant.now().toString()
        db.matchDao().insertMatches(listOf(match.toSyncedEntity(now)))
    }

    suspend fun updatePlayer(player: Player) {
        val now = Instant.now().toString()
        db.playerDao().updatePlayer(player.toSyncedEntity(now))
    }

    suspend fun addPlayer(player: Player) {
        val now = Instant.now().toString()
        db.playerDao().insertPlayers(listOf(player.toSyncedEntity(now)))
    }

    suspend fun getRemoteTeams() = try {
        val response = api.getTeams()
        response.teams.map { team ->
            val finalUrl = if (team.logoUrl.startsWith("http")) {
                team.logoUrl
            } else {
                "${BuildConfig.BASE_URL}${team.logoUrl}"
            }
            team.copy(logoUrl = finalUrl)
        }
    } catch (e: Exception) {
        emptyList()
    }
}
