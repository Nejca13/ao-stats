package com.example.myapplication.data.mapper

import com.example.myapplication.data.local.entity.AsadoEntity
import com.example.myapplication.data.local.entity.MatchEntity
import com.example.myapplication.data.local.entity.PlayerEntity
import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import com.example.myapplication.domain.model.TournamentConfig
import com.google.gson.Gson

private val gson = Gson()

fun PlayerEntity.toDomain() = Player(id, name, createdAt, avatarUrl, colorHex, elo)
fun Player.toEntity() = PlayerEntity(id, name, createdAt, avatarUrl, colorHex, elo, groupId = null, updatedAt = null, syncedAt = null)
fun Player.toSyncedEntity(now: String) = PlayerEntity(id, name, createdAt, avatarUrl, colorHex, elo, updatedAt = now, syncedAt = null)

fun MatchEntity.toDomain() = Match(id, asadoId, winnerId, loserId, winnerGoles, loserGoles, photoUrl, createdAt)
fun Match.toEntity() = MatchEntity(id, asadoId, winnerId, loserId, winnerGoles, loserGoles, photoUrl, createdAt, groupId = null, updatedAt = null, syncedAt = null)
fun Match.toSyncedEntity(now: String) = MatchEntity(id, asadoId, winnerId, loserId, winnerGoles, loserGoles, photoUrl, createdAt, updatedAt = now, syncedAt = null)

fun AsadoEntity.toDomain() = Asado(
    id,
    date,
    playerIds.split(",").filter { it.isNotBlank() },
    comment,
    isActive,
    tournamentConfigJson?.let { gson.fromJson(it, TournamentConfig::class.java) }
)

fun Asado.toEntity() = AsadoEntity(
    id,
    date,
    playerIds.joinToString(","),
    comment,
    isActive,
    tournamentConfig?.let { gson.toJson(it) },
    groupId = null,
    updatedAt = null,
    syncedAt = null
)

fun Asado.toSyncedEntity(now: String) = AsadoEntity(
    id,
    date,
    playerIds.joinToString(","),
    comment,
    isActive,
    tournamentConfig?.let { gson.toJson(it) },
    updatedAt = now,
    syncedAt = null
)
