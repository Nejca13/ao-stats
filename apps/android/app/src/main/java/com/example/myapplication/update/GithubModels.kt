package com.example.myapplication.update

import com.google.gson.annotations.SerializedName
import retrofit2.http.GET
import retrofit2.http.Path

data class GithubRelease(
    @SerializedName("tag_name") val tagName: String?,
    @SerializedName("body") val changelog: String?,
    @SerializedName("assets") val assets: List<GithubAsset>?
)

data class GithubAsset(
    @SerializedName("name") val name: String?,
    @SerializedName("browser_download_url") val downloadUrl: String?
)

interface GithubApi {
    @GET("repos/{owner}/{repo}/releases/latest")
    suspend fun getLatestRelease(
        @Path("owner") owner: String,
        @Path("repo") repo: String
    ): GithubRelease
}
