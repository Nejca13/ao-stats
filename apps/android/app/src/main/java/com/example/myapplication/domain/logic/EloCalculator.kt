package com.example.myapplication.domain.logic

import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import kotlin.math.pow
import kotlin.math.roundToInt

object EloCalculator {
    private const val K_FACTOR = 32

    fun calculateNewElos(winnerElo: Int, loserElo: Int): Pair<Int, Int> {
        val expectedW = 1.0 / (1.0 + 10.0.pow((loserElo - winnerElo) / 400.0))
        val expectedL = 1.0 / (1.0 + 10.0.pow((winnerElo - loserElo) / 400.0))

        val newEloWinner = (winnerElo + K_FACTOR * (1.0 - expectedW)).roundToInt()
        val newEloLoser = (loserElo + K_FACTOR * (0.0 - expectedL)).roundToInt()

        return Pair(newEloWinner, newEloLoser)
    }

    fun calculateHistoricalElos(players: List<Player>, matches: List<Match>): Map<String, Int> {
        val elos = players.associate { it.id to 1500 }.toMutableMap()

        matches.forEach { match ->
            val winnerElo = elos[match.winnerId] ?: 1500
            val loserElo = elos[match.loserId] ?: 1500

            val (newWinnerElo, newLoserElo) = calculateNewElos(winnerElo, loserElo)

            elos[match.winnerId] = newWinnerElo
            elos[match.loserId] = newLoserElo
        }

        return elos
    }
}
