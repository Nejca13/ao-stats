package com.example.myapplication.domain.model

import com.google.gson.annotations.SerializedName

data class Snapshot(
    val players: List<Player>,
    val asados: List<Asado>,
    val matches: List<Match>,
    val metadata: SnapshotMetadata
)

data class SnapshotMetadata(
    val version: String,
    @SerializedName("exportedAt") val exportedAt: String? = null,
    @SerializedName("serverReceivedAt") val serverReceivedAt: String? = null,
    @SerializedName("snapshotId") val snapshotId: String? = null
)
