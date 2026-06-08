package com.example.myapplication.data.sync

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.myapplication.AoApplication

class SyncWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    companion object {
        const val WORK_NAME = "background_data_sync"
        const val TAG = "SyncWorker"
    }

    override suspend fun doWork(): Result {
        val app = applicationContext as AoApplication
        val repository = app.repository
        val sessionManager = app.sessionManager

        if (!sessionManager.isLoggedIn()) {
            Log.d(TAG, "Skipping sync: not logged in")
            return Result.success()
        }

        Log.d(TAG, "Starting background sync")

        return try {
            val lastSync = sessionManager.getLastSyncTimestamp()

            // 1. Push local pending changes
            val pushResult = repository.pushLocalChanges()
            if (pushResult.isFailure) {
                Log.w(TAG, "Push failed: ${pushResult.exceptionOrNull()?.message}")
                // Continue to pull even if push fails
            } else {
                Log.d(TAG, pushResult.getOrThrow())
            }

            // 2. Pull remote changes
            val pullResult = repository.pullRemoteChanges(lastSync)
            if (pullResult.isFailure) {
                Log.w(TAG, "Pull failed: ${pullResult.exceptionOrNull()?.message}")
                return Result.retry()
            }

            val serverTime = pullResult.getOrThrow()
            sessionManager.setLastSyncTimestamp(serverTime)
            Log.d(TAG, "Sync complete, serverTime=$serverTime")

            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Sync error", e)
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }
}
