package com.example.myapplication.data.local

import com.example.myapplication.BuildConfig
import android.content.Context
import android.webkit.CookieManager as WebKitCookieManager
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.Interceptor

private val Context.sessionDataStore: DataStore<Preferences> by preferencesDataStore(name = "session")

class SessionManager(private val context: Context) {

    companion object {
        private val LOGGED_IN_KEY = booleanPreferencesKey("logged_in")
        private val COOKIE_STRING_KEY = stringPreferencesKey("cookies")
        private val SESSION_TOKEN_KEY = stringPreferencesKey("session_token")
        private val LAST_SYNC_KEY = stringPreferencesKey("last_sync_timestamp")
        private val AUTO_SYNC_KEY = booleanPreferencesKey("auto_sync_enabled")
        private val TERMS_ACCEPTED_KEY = booleanPreferencesKey("terms_accepted")
    }

    private val dataStore = context.sessionDataStore
    private val scope = CoroutineScope(Dispatchers.IO)

    private val cookieMap = mutableMapOf<String, MutableList<Cookie>>()
    private var sessionToken: String? = null
    private val serverHost = BuildConfig.BASE_URL.removePrefix("https://").removePrefix("http://").trimEnd('/')

    init {
        runBlocking {
            val prefs = dataStore.data.first()
            val saved = prefs[COOKIE_STRING_KEY]
            if (!saved.isNullOrBlank()) {
                parseAndStoreCookies(saved)
            }
            sessionToken = prefs[SESSION_TOKEN_KEY]
        }
    }

    val loggedIn: Flow<Boolean> = dataStore.data.map { it[LOGGED_IN_KEY] ?: false }

    val autoSyncEnabled: Flow<Boolean> = dataStore.data.map { it[AUTO_SYNC_KEY] ?: true }

    val termsAccepted: Flow<Boolean> = dataStore.data.map { it[TERMS_ACCEPTED_KEY] ?: false }

    suspend fun setTermsAccepted(value: Boolean) {
        dataStore.edit { it[TERMS_ACCEPTED_KEY] = value }
    }

    suspend fun hasAcceptedTerms(): Boolean = termsAccepted.first()

    suspend fun setLoggedIn(value: Boolean) {
        dataStore.edit { it[LOGGED_IN_KEY] = value }
    }

    suspend fun isLoggedIn(): Boolean = loggedIn.first()

    suspend fun getLastSyncTimestamp(): String? {
        return dataStore.data.first()[LAST_SYNC_KEY]
    }

    suspend fun setLastSyncTimestamp(timestamp: String) {
        dataStore.edit { it[LAST_SYNC_KEY] = timestamp }
    }

    suspend fun setAutoSyncEnabled(enabled: Boolean) {
        dataStore.edit { it[AUTO_SYNC_KEY] = enabled }
    }

    fun getSessionToken(): String? = sessionToken

    suspend fun setSessionToken(token: String) {
        sessionToken = token
        dataStore.edit { it[SESSION_TOKEN_KEY] = token }
    }

    suspend fun clearSession() {
        sessionToken = null
        cookieMap.clear()
        dataStore.edit {
            it.remove(LOGGED_IN_KEY)
            it.remove(COOKIE_STRING_KEY)
            it.remove(SESSION_TOKEN_KEY)
            it.remove(LAST_SYNC_KEY)
            it.remove(AUTO_SYNC_KEY)
        }
    }

    fun buildAuthInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            val token = sessionToken
            if (token != null && request.url.host.contains(serverHost)) {
                val withCookie = request.newBuilder()
                    .header("Cookie", "__Secure-authjs.session-token=$token")
                    .build()
                chain.proceed(withCookie)
            } else {
                chain.proceed(request)
            }
        }
    }

    fun importWebViewCookies() {
        val webkitManager = WebKitCookieManager.getInstance()
        val raw = webkitManager.getCookie(BuildConfig.BASE_URL) ?: return
        if (raw.isBlank()) return
        parseAndStoreCookies(raw)
        persistCookies()
        scope.launch { setLoggedIn(true) }
    }

    fun buildCookieJar(): CookieJar {
        return object : CookieJar {
            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                val host = url.host
                val list = cookieMap.getOrPut(host) { mutableListOf() }
                for (c in cookies) {
                    list.removeAll { it.name == c.name }
                    list.add(c)
                }
                persistCookies()
            }

            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                return cookieMap[url.host]?.filter {
                    it.expiresAt > System.currentTimeMillis()
                }.orEmpty()
            }
        }
    }

    private fun persistCookies() {
        val raw = cookieMap.values.flatten().joinToString("; ") { "${it.name}=${it.value}" }
        scope.launch { dataStore.edit { it[COOKIE_STRING_KEY] = raw } }
    }

    private fun parseAndStoreCookies(raw: String) {
        cookieMap.clear()
        val parts = raw.split(";").map { it.trim() }
        for (part in parts) {
            val eq = part.indexOf('=')
            if (eq > 0) {
                val name = part.substring(0, eq)
                val value = part.substring(eq + 1)
                try {
                    val cookie = Cookie.Builder()
                        .name(name)
                        .value(value)
                        .domain(serverHost)
                        .path("/")
                        .secure()
                        .httpOnly()
                        .expiresAt(Long.MAX_VALUE)
                        .build()
                    cookieMap.getOrPut(serverHost) { mutableListOf() }.add(cookie)
                } catch (_: Exception) {
                    // skip malformed cookies
                }
            }
        }
    }
}
