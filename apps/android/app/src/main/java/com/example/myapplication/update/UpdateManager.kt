package com.example.myapplication.update

import android.app.DownloadManager
import android.content.*
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.widget.Toast
import androidx.core.content.FileProvider
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File

sealed interface UpdateStatus {
    object Idle : UpdateStatus
    data class Downloading(val progress: Float = 0f) : UpdateStatus
    object ReadyToInstall : UpdateStatus
    data class Error(val message: String) : UpdateStatus
}

class UpdateManager(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _status = MutableStateFlow<UpdateStatus>(UpdateStatus.Idle)
    val status: StateFlow<UpdateStatus> = _status.asStateFlow()

    private var isDownloading = false
    var pendingInstallApkName: String? = null
    private var downloadId: Long = -1L
    private var progressJob: Job? = null

    fun checkPendingInstall() {
        pendingInstallApkName?.let { fileName ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (context.packageManager.canRequestPackageInstalls()) {
                    pendingInstallApkName = null
                    installApk(fileName)
                } else {
                    _status.value = UpdateStatus.ReadyToInstall
                }
            } else {
                pendingInstallApkName = null
                installApk(fileName)
            }
        }
    }

    fun downloadAndInstall(url: String, version: String) {
        val fileName = "update_${version}.apk"
        val downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
        val file = File(downloadDir, fileName)

        downloadDir?.listFiles()
            ?.filter { it.name.startsWith("update_") && it.name != fileName }
            ?.forEach { it.delete() }

        if (file.exists()) {
            _status.value = UpdateStatus.ReadyToInstall
            installApk(fileName)
            return
        }
        
        if (isDownloading) {
            Toast.makeText(context, "Ya hay una descarga en curso...", Toast.LENGTH_SHORT).show()
            return
        }
        isDownloading = true
        _status.value = UpdateStatus.Downloading(0f)

        val request = DownloadManager.Request(Uri.parse(url))
            .setTitle("Actualizando App")
            .setDescription("Nueva versión $version")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, fileName)
            .setMimeType("application/vnd.android.package-archive")

        val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        downloadId = dm.enqueue(request)

        progressJob?.cancel()
        progressJob = scope.launch {
            while (isActive) {
                val query = DownloadManager.Query().setFilterById(downloadId)
                val cursor: Cursor = dm.query(query)
                if (cursor.moveToFirst()) {
                    val bytesIdx = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
                    val totalIdx = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
                    val bytesDownloaded = if (bytesIdx >= 0) cursor.getLong(bytesIdx) else 0L
                    val totalBytes = if (totalIdx >= 0) cursor.getLong(totalIdx) else 0L
                    if (totalBytes > 0) {
                        _status.value = UpdateStatus.Downloading(
                            (bytesDownloaded.toFloat() / totalBytes.toFloat()).coerceIn(0f, 1f)
                        )
                    }
                }
                cursor.close()
                delay(300)
            }
        }

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context?, intent: Intent?) {
                val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
                if (id == downloadId) {
                    isDownloading = false
                    progressJob?.cancel()
                    val query = DownloadManager.Query().setFilterById(downloadId)
                    val cursor: Cursor = dm.query(query)
                    if (cursor.moveToFirst()) {
                        val columnIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                        val statusValue = if (columnIndex >= 0) cursor.getInt(columnIndex) else -1
                        if (statusValue == DownloadManager.STATUS_SUCCESSFUL) {
                            _status.value = UpdateStatus.ReadyToInstall
                            installApk(fileName)
                        } else {
                            _status.value = UpdateStatus.Error("Descarga fallida.")
                        }
                    } else {
                        _status.value = UpdateStatus.Error("No se encontró el estado de la descarga.")
                    }
                    cursor.close()
                    context.unregisterReceiver(this)
                }
            }
        }
        
        val flag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) Context.RECEIVER_EXPORTED else 0
        context.registerReceiver(receiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), flag)
    }

    fun installApk(fileName: String) {
        try {
            val file = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
            if (!file.exists()) {
                _status.value = UpdateStatus.Error("El archivo no existe.")
                return
            }

            // Validar que el APK sea válido y corresponda a nuestra app
            val packageInfo = context.packageManager.getPackageArchiveInfo(file.absolutePath, 0)
            if (packageInfo == null || packageInfo.packageName != context.packageName) {
                file.delete()
                _status.value = UpdateStatus.Error("El archivo de actualización es inválido.")
                Toast.makeText(context, "El archivo de actualización es inválido.", Toast.LENGTH_LONG).show()
                return
            }

            // Validar que el versionCode del APK sea estrictamente mayor al actual
            val currentVersionInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            val currentCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) currentVersionInfo.longVersionCode else currentVersionInfo.versionCode.toLong()
            val apkCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) packageInfo.longVersionCode else packageInfo.versionCode.toLong()

            if (apkCode <= currentCode) {
                file.delete()
                _status.value = UpdateStatus.Idle
                Toast.makeText(context, "La actualización descargada no es más reciente.", Toast.LENGTH_LONG).show()
                return
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    pendingInstallApkName = fileName
                    _status.value = UpdateStatus.ReadyToInstall
                    Toast.makeText(context, "Por favor, otorga el permiso para continuar.", Toast.LENGTH_LONG).show()
                    val intent = Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES)
                    intent.data = Uri.parse("package:${context.packageName}")
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                    return
                }
            }

            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            _status.value = UpdateStatus.Error(e.localizedMessage ?: "Error de instalación")
        }
    }
}
