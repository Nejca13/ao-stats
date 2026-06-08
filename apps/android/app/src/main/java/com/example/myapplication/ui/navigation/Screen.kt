package com.example.myapplication.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Asado : Screen("asado", "Asados")
    object Stats : Screen("stats", "Stats")
    object Players : Screen("players", "Jugadores")
    object Sync : Screen("sync", "Sincro")
    object Login : Screen("login", "Cuenta")
    object Help : Screen("help", "Ayuda")
    
    // Details
    object MatchDetails : Screen("match_details/{asadoId}", "Partidos") {
        fun createRoute(asadoId: String) = "match_details/$asadoId"
    }

    object ActiveAsado : Screen("active_asado/{asadoId}", "Asado Activo") {
        fun createRoute(asadoId: String) = "active_asado/$asadoId"
    }
}
