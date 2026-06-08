package com.example.myapplication.data.remote

import com.example.myapplication.domain.model.Snapshot
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AoApiService {
    @GET("api/ao")
    suspend fun getSnapshot(): Snapshot

    @POST("api/ao")
    suspend fun postSnapshot(@Body snapshot: Snapshot)

    @GET("api/ao/teams")
    suspend fun getTeams(): TeamResponse

    @GET("api/v1/players")
    suspend fun getPlayers(): PlayersResponse

    @GET("api/v1/asados")
    suspend fun getAsados(): AsadosResponse

    @GET("api/v1/matches")
    suspend fun getMatches(): MatchesResponse
}

data class PlayersResponse(
    val players: List<com.example.myapplication.domain.model.Player>,
    val legacy: Boolean = false,
)

data class AsadosResponse(
    val asados: List<com.example.myapplication.domain.model.Asado>,
    val limited: Boolean = false,
    val total: Int = 0,
    val legacy: Boolean = false,
)

data class MatchesResponse(
    val matches: List<com.example.myapplication.domain.model.Match>,
    val limited: Boolean = false,
    val total: Int = 0,
    val legacy: Boolean = false,
)

data class TeamResponse(
    val status: String,
    val count: Int,
    val teams: List<TeamBadge>
)

data class TeamBadge(
    val id: String,
    val name: String,
    val logoUrl: String
)
