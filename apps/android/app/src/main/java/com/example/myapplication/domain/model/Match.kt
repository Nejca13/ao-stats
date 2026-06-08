package com.example.myapplication.domain.model

import com.google.gson.annotations.SerializedName

data class Match(
    @SerializedName("id") val id: String,
    @SerializedName("asadoId", alternate = ["asado_id"]) val asadoId: String,
    @SerializedName("winnerId", alternate = ["winner_id"]) val winnerId: String,
    @SerializedName("loserId", alternate = ["loser_id"]) val loserId: String,
    @SerializedName("winnerGoles", alternate = ["winner_goles"]) val winnerGoles: Int? = null,
    @SerializedName("loserGoles", alternate = ["loser_goles"]) val loserGoles: Int? = null,
    @SerializedName("photoUrl", alternate = ["photo_url"]) val photoUrl: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null
)
