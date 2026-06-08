package com.example.myapplication.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "players")
data class PlayerEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: String?,
    val avatarUrl: String?,
    val colorHex: String?,
    val elo: Int?
)
