package com.example.myapplication.domain.model

import com.example.myapplication.BuildConfig
import com.google.gson.annotations.SerializedName

data class Player(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("createdAt", alternate = ["created_at"]) val createdAt: String? = null,
    @SerializedName("avatarUrl", alternate = ["avatar_url"]) val avatarUrl: String? = null,
    @SerializedName("colorHex", alternate = ["color_hex"]) val colorHex: String? = null,
    @SerializedName("elo") val elo: Int? = 1500
)

fun Player.resolveAvatarUrl(): String? {
    val url = this.avatarUrl ?: return null
    
    // Si ya es una URL web o ruta absoluta, usarla directamente
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
        return url
    }
    
    // Si es un ID de equipo simple (ej. "riverplate_fc" o "riverplate-fc")
    val cleanId = url.replace("_", "-")
    return "${BuildConfig.BASE_URL}/api_teams/$cleanId.png"
}
