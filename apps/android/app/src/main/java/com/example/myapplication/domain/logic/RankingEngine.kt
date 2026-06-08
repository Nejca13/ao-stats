package com.example.myapplication.domain.logic

import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import kotlin.math.pow
import kotlin.math.roundToInt

data class PlayerStats(
    val playerId: String,
    val played: Int = 0,
    val wins: Int = 0,
    val losses: Int = 0,
    val goalsScored: Int = 0,
    val goalsConceded: Int = 0,
    val winRate: Double = 0.0,
    val totalPoints: Int = 0,
    val averagePoints: Double = 0.0,
    val mvpCount: Int = 0,
    val bestVictimId: String? = null,
    val nemesisId: String? = null,
    val elo: Int = 1500,
    val asadosPlayed: Int = 0
) {
    val goalDiff: Int get() = goalsScored - goalsConceded
    val avgGoalsScored: Double get() = if (played > 0) (goalsScored.toDouble() / played * 100.0).roundToInt() / 100.0 else 0.0
}

data class AsadoRanking(
    val asadoId: String,
    val date: String,
    val rankings: List<AsadoPlayerRank>
)

data class AsadoPlayerRank(
    val playerId: String,
    val wins: Int,
    val losses: Int,
    val points: Int,
    val position: Int // 1-based
)

object RankingEngine {

    // Orden: mas wins > menos losses > H2H directo en el asado
    private fun compareAsado(
        p1: String, p2: String,
        stats: Map<String, Pair<Int, Int>>,
        h2hCache: Map<Pair<String, String>, Int>
    ): Int {
        val s1 = stats[p1] ?: (0 to 0)
        val s2 = stats[p2] ?: (0 to 0)
        if (s1.first != s2.first) return s2.first - s1.first
        if (s1.second != s2.second) return s1.second - s2.second
        return h2hCache[p1 to p2] ?: 0
    }

    private fun buildPointScale(n: Int): List<Int> {
        if (n <= 0) return emptyList()
        if (n == 1) return listOf(10)
        return List(n) { i -> (10.0 - (9.0 * i) / (n - 1)).roundToInt().coerceAtLeast(1) }
    }

    fun processAllStats(players: List<Player>, asados: List<Asado>, matches: List<Match>): List<PlayerStats> {
        // 1. Initial State
        var statsMap = players.associate { it.id to PlayerStats(it.id) }.toMutableMap()
        val h2hMap = mutableMapOf<String, MutableMap<String, Pair<Int, Int>>>()

        // 2. Sort Data Chronologically
        val sortedAsados = asados.sortedBy { it.date }
        val sortedMatches = matches.sortedBy { it.createdAt ?: "" }
        val matchesByAsado = sortedMatches.groupBy { it.asadoId }

        // 3. ELO historico (incluye penalidad por inasistencia, igual que el server)
        val eloMap = EloCalculator.calculateHistoricalElos(players, matches, asados)

        // 4. Per Asado Processing
        sortedAsados.forEach { asado ->
            val asadoMatches = matchesByAsado[asado.id] ?: emptyList()
            if (asadoMatches.isEmpty()) return@forEach

            val participants = asado.playerIds.distinct()

            val asadoPlayerStats = participants.map { pid ->
                val pWins = asadoMatches.count { it.winnerId == pid }
                val pLosses = asadoMatches.count { it.loserId == pid }
                pid to (pWins to pLosses)
            }.toMap()

            // Precompute H2H for all pairs in this asado
            val h2hCache = mutableMapOf<Pair<String, String>, Int>()
            for (i in participants.indices) {
                for (j in i + 1 until participants.size) {
                    val p1 = participants[i]
                    val p2 = participants[j]
                    val p1Wins = asadoMatches.count { it.winnerId == p1 && it.loserId == p2 }
                    val p2Wins = asadoMatches.count { it.winnerId == p2 && it.loserId == p1 }
                    val result = p2Wins.compareTo(p1Wins)
                    h2hCache[p1 to p2] = result
                    h2hCache[p2 to p1] = -result
                }
            }

            // Sort Asado Ranking
            val sortedParticipants = participants.sortedWith { p1, p2 ->
                compareAsado(p1, p2, asadoPlayerStats, h2hCache)
            }

            // Assign Points con posiciones empatadas (igual que shared package)
            val pointScale = buildPointScale(sortedParticipants.size)
            var pos = 1
            for (i in sortedParticipants.indices) {
                if (i > 0 && compareAsado(sortedParticipants[i - 1], sortedParticipants[i], asadoPlayerStats, h2hCache) != 0) {
                    pos = i + 1
                }
                val pid = sortedParticipants[i]
                val points = pointScale.getOrElse(pos - 1) { 1 }

                // Track H2H global para victim/nemesis
                val asadoMatchesForH2H = asadoMatches.filter { it.winnerId == pid || it.loserId == pid }
                for (match in asadoMatchesForH2H) {
                    if (match.winnerId == pid) updateH2H(h2hMap, pid, match.loserId)
                    else updateH2H(h2hMap, match.loserId, pid)
                }

                val current = statsMap[pid] ?: PlayerStats(pid)
                statsMap[pid] = current.copy(
                    totalPoints = current.totalPoints + points,
                    mvpCount = current.mvpCount + if (pos == 1) 1 else 0,
                    asadosPlayed = current.asadosPlayed + 1
                )
            }
        }

        // 5. Finalize Global Stats
        return statsMap.values.map { stats ->
            val pMatches = sortedMatches.filter { it.winnerId == stats.playerId || it.loserId == stats.playerId }

            var goalsScored = 0
            var goalsConceded = 0
            var wins = 0
            var losses = 0

            pMatches.forEach { match ->
                if (match.winnerId == stats.playerId) {
                    wins++
                    goalsScored += (match.winnerGoles ?: 0)
                    goalsConceded += (match.loserGoles ?: 0)
                } else {
                    losses++
                    goalsScored += (match.loserGoles ?: 0)
                    goalsConceded += (match.winnerGoles ?: 0)
                }
            }

            val played = wins + losses

            val winRate = if (played > 0) (wins.toDouble() / played * 100.0) else 0.0
            val avgPoints = if (stats.asadosPlayed > 0) (stats.totalPoints.toDouble() / stats.asadosPlayed) else 0.0

            val bestVictim = h2hMap[stats.playerId]?.maxByOrNull { it.value.first }?.key
            val nemesis = h2hMap[stats.playerId]?.maxByOrNull { it.value.second }?.key

            stats.copy(
                played = played,
                wins = wins,
                losses = losses,
                goalsScored = goalsScored,
                goalsConceded = goalsConceded,
                winRate = (winRate * 100.0).roundToInt() / 100.0,
                averagePoints = (avgPoints * 100.0).roundToInt() / 100.0,
                elo = eloMap[stats.playerId] ?: 1500,
                bestVictimId = bestVictim,
                nemesisId = nemesis
            )
        }.sortedByDescending { it.totalPoints }
    }

    private fun updateH2H(map: MutableMap<String, MutableMap<String, Pair<Int, Int>>>, winner: String, loser: String) {
        val winnerDict = map.getOrPut(winner) { mutableMapOf() }
        val currentW = winnerDict.getOrDefault(loser, 0 to 0)
        winnerDict[loser] = (currentW.first + 1) to currentW.second

        val loserDict = map.getOrPut(loser) { mutableMapOf() }
        val currentL = loserDict.getOrDefault(winner, 0 to 0)
        loserDict[winner] = currentL.first to (currentL.second + 1)
    }

    fun calculatePerAsadoRankings(asados: List<Asado>, matches: List<Match>): List<AsadoRanking> {
        val sortedAsados = asados.sortedByDescending { it.date }
        val matchesByAsado = matches.groupBy { it.asadoId }

        return sortedAsados.mapNotNull { asado ->
            val asadoMatches = matchesByAsado[asado.id] ?: return@mapNotNull null
            val participants = asado.playerIds.distinct()

            val asadoPlayerStats = participants.map { pid ->
                val pWins = asadoMatches.count { it.winnerId == pid }
                val pLosses = asadoMatches.count { it.loserId == pid }
                pid to (pWins to pLosses)
            }.toMap()

            val h2hCache = mutableMapOf<Pair<String, String>, Int>()
            for (i in participants.indices) {
                for (j in i + 1 until participants.size) {
                    val p1 = participants[i]
                    val p2 = participants[j]
                    val p1Wins = asadoMatches.count { it.winnerId == p1 && it.loserId == p2 }
                    val p2Wins = asadoMatches.count { it.winnerId == p2 && it.loserId == p1 }
                    val result = p2Wins.compareTo(p1Wins)
                    h2hCache[p1 to p2] = result
                    h2hCache[p2 to p1] = -result
                }
            }

            val sortedParticipants = participants.sortedWith { p1, p2 ->
                compareAsado(p1, p2, asadoPlayerStats, h2hCache)
            }

            val pointScale = buildPointScale(sortedParticipants.size)
            var pos = 1
            val rankings = mutableListOf<AsadoPlayerRank>()
            for (i in sortedParticipants.indices) {
                if (i > 0 && compareAsado(sortedParticipants[i - 1], sortedParticipants[i], asadoPlayerStats, h2hCache) != 0) {
                    pos = i + 1
                }
                val pid = sortedParticipants[i]
                val stats = asadoPlayerStats[pid] ?: (0 to 0)
                val points = pointScale.getOrElse(pos - 1) { 1 }
                rankings.add(AsadoPlayerRank(pid, stats.first, stats.second, points, pos))
            }

            AsadoRanking(asado.id, asado.date, rankings)
        }
    }
}
