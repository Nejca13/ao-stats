package com.example.myapplication.domain.model

import com.google.gson.annotations.SerializedName

data class TournamentConfig(
    @SerializedName("mode") val mode: TournamentMode = TournamentMode.NONE,
    @SerializedName("status") val status: TournamentStatus = TournamentStatus.NOT_STARTED,
    @SerializedName("participants") val participants: List<String> = emptyList(), // Player IDs currently in the house
    @SerializedName("winnerStaysConfig") val winnerStaysConfig: WinnerStaysConfig? = null,
    @SerializedName("leagueConfig") val leagueConfig: LeagueConfig? = null,
    @SerializedName("oneVsOneConfig") val oneVsOneConfig: OneVsOneConfig? = null
)

enum class TournamentMode {
    @SerializedName("none") NONE,
    @SerializedName("winner_stays") WINNER_STAYS,
    @SerializedName("league") LEAGUE,
    @SerializedName("one_vs_one") ONE_VS_ONE
}

enum class TournamentStatus {
    @SerializedName("not_started") NOT_STARTED,
    @SerializedName("in_progress") IN_PROGRESS,
    @SerializedName("finished") FINISHED
}

data class WinnerStaysConfig(
    @SerializedName("currentWinner") val currentWinnerId: String? = null,
    @SerializedName("nextChallenger") val nextChallengerId: String? = null,
    @SerializedName("queue") val queue: List<String> = emptyList()
)

data class LeagueConfig(
    @SerializedName("fixtures") val fixtures: List<TournamentMatch> = emptyList()
)

data class OneVsOneConfig(
    @SerializedName("player1Id") val player1Id: String,
    @SerializedName("player2Id") val player2Id: String,
    @SerializedName("player1Wins") val player1Wins: Int = 0,
    @SerializedName("player2Wins") val player2Wins: Int = 0,
    @SerializedName("targetWins") val targetWins: Int = 3
)

data class TournamentMatch(
    @SerializedName("player1Id") val player1Id: String,
    @SerializedName("player2Id") val player2Id: String,
    @SerializedName("status") val status: MatchStatus = MatchStatus.PENDING
)

enum class MatchStatus {
    @SerializedName("pending") PENDING,
    @SerializedName("completed") COMPLETED,
    @SerializedName("cancelled") CANCELLED
}
