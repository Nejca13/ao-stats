package com.example.myapplication

import android.app.Application
import androidx.room.Room
import com.example.myapplication.data.local.AppDatabase
import com.example.myapplication.data.local.SessionManager
import com.example.myapplication.data.remote.AoApiService
import com.example.myapplication.BuildConfig
import com.example.myapplication.data.remote.CloudinaryManager
import com.example.myapplication.data.repository.AoRepository
import com.example.myapplication.update.GithubApi
import com.example.myapplication.update.UpdateManager
import com.example.myapplication.update.UpdateService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AoApplication : Application() {

    lateinit var repository: AoRepository
    lateinit var updateService: UpdateService
    lateinit var updateManager: UpdateManager
    lateinit var sessionManager: SessionManager

    override fun onCreate() {
        super.onCreate()

        CloudinaryManager.init(this)

        sessionManager = SessionManager(this)

        val db = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "ao_database"
        ).addMigrations(AppDatabase.MIGRATION_5_6)
            .build()

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(sessionManager.buildAuthInterceptor())
            .cookieJar(sessionManager.buildCookieJar())
            .addInterceptor(logging)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL + "/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val githubApi = Retrofit.Builder()
            .baseUrl("https://api.github.com/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(GithubApi::class.java)

        val api = retrofit.create(AoApiService::class.java)

        repository = AoRepository(db, api)
        updateService = UpdateService(this, githubApi)
        updateManager = UpdateManager(this)
    }
}
