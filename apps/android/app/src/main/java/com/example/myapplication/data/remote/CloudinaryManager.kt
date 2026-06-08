package com.example.myapplication.data.remote

import android.content.Context
import android.net.Uri
import com.cloudinary.android.MediaManager
import com.cloudinary.android.callback.ErrorInfo
import com.cloudinary.android.callback.UploadCallback
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

object CloudinaryManager {
    private var isInitialized = false

    fun init(context: Context) {
        if (isInitialized) return
        
        val config = mapOf(
            "cloud_name" to "dnsktunfa",
            "api_key" to "768551423838326",
            "api_secret" to "sBmxMMl9_T98jJhBIAexqsjK-gU"
        )
        MediaManager.init(context, config)
        isInitialized = true
    }

    suspend fun uploadPhoto(uri: Uri, folder: String): String? = suspendCancellableCoroutine { continuation ->
        MediaManager.get().upload(uri)
            .option("folder", folder)
            .callback(object : UploadCallback {
                override fun onStart(requestId: String) {}
                override fun onProgress(requestId: String, bytes: Long, totalBytes: Long) {}
                override fun onSuccess(requestId: String, resultData: Map<*, *>) {
                    val url = resultData["secure_url"] as? String
                    continuation.resume(url)
                }
                override fun onError(requestId: String, error: ErrorInfo) {
                    continuation.resume(null)
                }
                override fun onReschedule(requestId: String, error: ErrorInfo) {}
            })
            .dispatch()
    }
}
