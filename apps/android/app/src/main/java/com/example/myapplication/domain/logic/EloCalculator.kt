package com.example.myapplication.domain.logic

import com.example.myapplication.domain.model.Asado
import com.example.myapplication.domain.model.Match
import com.example.myapplication.domain.model.Player
import kotlin.math.pow
import kotlin.math.roundToInt

object EloCalculator {
    private const val K_FACTOR = 32
    private const val NO_SHOW_PENALTY = 16
    private const val ELO_FLOOR = 1400

    fun calculateNewElos(winnerElo: Int, loserElo: Int): Pair<Int, Int> {
        val expectedW = 1.0 / (1.0 + 10.0.pow((loserElo - winnerElo) / 400.0))
        val expectedL = 1.0 / (1.0 + 10.0.pow((winnerElo - loserElo) / 400.0))

        val newEloWinner = (winnerElo + K_FACTOR * (1.0 - expectedW)).roundToInt()
        val newEloLoser = (loserElo + K_FACTOR * (0.0 - expectedL)).roundToInt()

        return Pair(newEloWinner, newEloLoser)
    }

    fun calculateHistoricalElos(
        players: List<Player>,
        matches: List<Match>,
        asados: List<Asado>
    ): Map<String, Int> {
        val elos = players.associate { it.id to 1500 }.toMutableMap()

        val sortedAsados = asados.sortedBy { it.date }

        for (asado in sortedAsados) {
            val attendingIds = asado.playerIds.toSet()
            val asadoMatches = matches.filter { it.asadoId == asado.id }

            // Solo procesar partidos donde ambos jugadores asisten
            for (match in asadoMatches) {
                if (match.winnerId !in attendingIds || match.loserId !in attendingIds) continue

                val winnerElo = elos[match.winnerId] ?: 1500
                val loserElo = elos[match.loserId] ?: 1500

                val (newWinnerElo, newLoserElo) = calculateNewElos(winnerElo, loserElo)

                elos[match.winnerId] = newWinnerElo
                elos[match.loserId] = newLoserElo
            }

            // Penalidad ELO para jugadores que no asisten
            for (player in players) {
                if (player.id in attendingIds) continue
                val currentElo = elos[player.id] ?: continue
                if (currentElo != 1500) {
                    elos[player.id] = maxOf(ELO_FLOOR, currentElo - NO_SHOW_PENALTY)
                }
            }
        }

        return elos
    }
}
