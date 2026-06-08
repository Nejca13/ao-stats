package com.example.myapplication.data.local.dao

import androidx.room.*
import com.example.myapplication.data.local.entity.AsadoEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AsadoDao {
    @Query("SELECT * FROM asados")
    fun getAllAsados(): Flow<List<AsadoEntity>>

    @Query("SELECT * FROM asados")
    suspend fun getAllAsadosList(): List<AsadoEntity>

    @Query("SELECT * FROM asados WHERE isActive = 1 LIMIT 1")
    fun getActiveAsado(): Flow<AsadoEntity?>

    @Query("SELECT * FROM asados WHERE syncedAt IS NULL OR syncedAt < updatedAt")
    suspend fun getPendingChanges(): List<AsadoEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAsados(asados: List<AsadoEntity>)

    @Update
    suspend fun updateAsado(asado: AsadoEntity)

    @Query("DELETE FROM asados")
    suspend fun deleteAllAsados()
}
