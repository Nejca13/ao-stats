package com.example.myapplication.ui.theme

import android.content.Context
import com.example.myapplication.R
import com.example.myapplication.domain.model.resolveAvatarUrl
import com.example.myapplication.domain.model.Player

object PlayerIcons {
    private val TEAM_AVATARS_MAP = mapOf(
        "5ee34512-1df1-48bf-a236-00f2d2aebdad" to R.drawable.mansfieldtown,
        "5ae24da6-2b7c-4f23-afce-c5a9cf0f5d79" to R.drawable.swindontown,
        "f67a4e49-0ec8-4983-a647-65703697c5db" to R.drawable.tranmererovers,
        "d0552b10-0b9c-45dd-9fab-39481025c64e" to R.drawable.walsal
    )

    private val BADGE_DRAWABLE_MAP = mapOf(
        "walsal" to R.drawable.walsal,
        "wexham" to R.drawable.wexham,
        "barrowafc" to R.drawable.barrowafc,
        "morecambe" to R.drawable.morecambe,
        "sc_bastia" to R.drawable.sc_bastia,
        "stockport" to R.drawable.stockport,
        "colchester" to R.drawable.colchester,
        "genoble_gf" to R.drawable.genoble_gf,
        "crawleytown" to R.drawable.crawleytown,
        "forestgreen" to R.drawable.forestgreen,
        "gillinhamfc" to R.drawable.gillinhamfc,
        "grimsbytown" to R.drawable.grimsbytown,
        "rochdaleafc" to R.drawable.rochdaleafc,
        "salfordcity" to R.drawable.salfordcity,
        "stevenagefc" to R.drawable.stevenagefc,
        "swindontown" to R.drawable.swindontown,
        "afcwimbledon" to R.drawable.afcwimbledon,
        "bradfordcity" to R.drawable.bradfordcity,
        "leytonorient" to R.drawable.leytonorient,
        "miltonkeynes" to R.drawable.miltonkeynes,
        "nottscountry" to R.drawable.nottscountry,
        "suttonunited" to R.drawable.suttonunited,
        "harrogatetown" to R.drawable.harrogatetown,
        "mansfieldtown" to R.drawable.mansfieldtown,
        "newportcounty" to R.drawable.newportcounty,
        "riverplate_fc" to R.drawable.riverplate_fc,
        "crewealexandra" to R.drawable.crewealexandra,
        "tranmererovers" to R.drawable.tranmererovers,
        "doncasterrovers" to R.drawable.doncasterrovers,
        "northamptontown" to R.drawable.northamptontown,
        "accrintonstanley" to R.drawable.accrintonstanley,
        "hartlepoolunited" to R.drawable.hartlepoolunited
    )

    fun getBadgeResId(badgeName: String): Int {
        return BADGE_DRAWABLE_MAP[badgeName] ?: 0
    }

    fun getAvatar(playerId: String, avatarUrl: String?, context: Context): Any {
        if (!avatarUrl.isNullOrEmpty()) {
            val resId = getBadgeResId(avatarUrl)
            if (resId != 0) return resId
            val dummyPlayer = Player(id = playerId, name = "", avatarUrl = avatarUrl)
            return dummyPlayer.resolveAvatarUrl() ?: avatarUrl
        }
        return TEAM_AVATARS_MAP[playerId] ?: R.drawable.ic_launcher_foreground
    }

    fun getAvatar(playerId: String): Int {
        return TEAM_AVATARS_MAP[playerId] ?: R.drawable.ic_launcher_foreground
    }

    val DRAWABLE_BADGES = BADGE_DRAWABLE_MAP.keys.toList()
}
