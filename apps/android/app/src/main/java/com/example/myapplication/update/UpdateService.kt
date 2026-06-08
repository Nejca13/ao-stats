package com.example.myapplication.update

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.dataStore by preferencesDataStore(name = "update_prefs")

class UpdateService(
    private val context: Context,
    private val api: GithubApi
) {
    private val LAST_CHECK_KEY = longPreferencesKey("last_check")

    suspend fun checkForUpdates(owner: String, repo: String, currentVersion: String): GithubRelease? {
        return try {
            val latest = api.getLatestRelease(owner, repo)
            context.dataStore.edit { it[LAST_CHECK_KEY] = System.currentTimeMillis() }

            val remoteTag = latest.tagName ?: return null
            val remote = remoteTag.replace("v", "").trim()
            val local = currentVersion.replace("v", "").trim()

            if (isRemoteNewer(local, remote)) latest else null
        } catch (e: Exception) {
            null
        }
    }

    private fun isRemoteNewer(local: String, remote: String): Boolean {
        val localParts = local.split(".").map { it.toIntOrNull() ?: 0 }
        val remoteParts = remote.split(".").map { it.toIntOrNull() ?: 0 }
        
        val maxLength = maxOf(localParts.size, remoteParts.size)
        for (i in 0 until maxLength) {
            val l = localParts.getOrElse(i) { 0 }
            val r = remoteParts.getOrElse(i) { 0 }
            if (r > l) return true
            if (r < l) return false
        }
        return false
    }
}
