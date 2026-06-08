package com.example.myapplication.data.remote

import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface AoApiService {
    @GET("api/v1/sync")
    suspend fun getSync(@Query("since") since: String? = null): SyncResponse

    @POST("api/v1/sync")
    suspend fun postSync(@Body body: SyncRequest): SyncResponse

    @GET("api/ao/teams")
    suspend fun getTeams(): TeamResponse

    @GET("api/v1/players")
    suspend fun getPlayers(): PlayersResponse

    @GET("api/v1/asados")
    suspend fun getAsados(): AsadosResponse

    @GET("api/v1/matches")
    suspend fun getMatches(): MatchesResponse
}

data class SyncRequest(
    val players: List<Player>? = null,
    val asados: List<Asado>? = null,
    val matches: List<Match>? = null
)

data class SyncUpserted(
    val players: Int = 0,
    val asados: Int = 0,
    val matches: Int = 0
)

data class SyncResponse(
    val status: String? = null,
    val players: List<Player> = emptyList(),
    val asados: List<Asado> = emptyList(),
    val matches: List<Match> = emptyList(),
    val serverTime: String? = null,
    val upserted: SyncUpserted? = null
)

data class PlayersResponse(
    val players: List<Player>,
)

data class AsadosResponse(
    val asados: List<Asado>,
    val limited: Boolean = false,
    val total: Int = 0,
)

data class MatchesResponse(
    val matches: List<Match>,
    val limited: Boolean = false,
    val total: Int = 0,
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
