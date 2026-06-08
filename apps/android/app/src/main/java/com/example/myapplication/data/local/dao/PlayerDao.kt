package com.example.myapplication.data.local.dao

import androidx.room.*
import com.example.myapplication.data.local.entity.PlayerEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PlayerDao {
    @Query("SELECT * FROM players")
    fun getAllPlayers(): Flow<List<PlayerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlayers(players: List<PlayerEntity>)

    @Query("DELETE FROM players")
    suspend fun deleteAllPlayers()

    @Update
    suspend fun updatePlayer(player: PlayerEntity)
}
