package com.example.myapplication.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "matches")
data class MatchEntity(
    @PrimaryKey val id: String,
    val asadoId: String,
    val winnerId: String,
    val loserId: String,
    val winnerGoles: Int?,
    val loserGoles: Int?,
    val photoUrl: String?,
    val createdAt: String?
)
