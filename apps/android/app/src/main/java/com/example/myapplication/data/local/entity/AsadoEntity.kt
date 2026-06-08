package com.example.myapplication.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "asados")
data class AsadoEntity(
    @PrimaryKey val id: String,
    val date: String,
    val playerIds: String,
    val comment: String?,
    val isActive: Boolean? = false,
    val tournamentConfigJson: String? = null,
    val groupId: String? = null,
    val updatedAt: String? = null,
    val syncedAt: String? = null
)
