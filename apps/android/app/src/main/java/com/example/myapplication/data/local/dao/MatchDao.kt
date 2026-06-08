package com.example.myapplication.data.local.dao

import androidx.room.*
import com.example.myapplication.data.local.entity.MatchEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MatchDao {
    @Query("SELECT * FROM matches")
    fun getAllMatches(): Flow<List<MatchEntity>>

    @Query("SELECT * FROM matches")
    suspend fun getAllMatchesList(): List<MatchEntity>

    @Query("SELECT * FROM matches WHERE asadoId = :asadoId")
    fun getMatchesByAsadoId(asadoId: String): Flow<List<MatchEntity>>

    @Query("SELECT * FROM matches WHERE syncedAt IS NULL OR syncedAt < updatedAt")
    suspend fun getPendingChanges(): List<MatchEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMatches(matches: List<MatchEntity>)

    @Query("DELETE FROM matches")
    suspend fun deleteAllMatches()
}
