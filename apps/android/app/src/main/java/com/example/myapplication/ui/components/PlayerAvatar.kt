package com.example.myapplication.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import coil.compose.AsyncImage
import com.example.myapplication.ui.theme.PlayerIcons

@Composable
fun PlayerAvatar(
    playerId: String,
    avatarUrl: String?,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val avatar = PlayerIcons.getAvatar(playerId, avatarUrl, context)

    if (avatar is Int) {
        Image(
            painter = painterResource(id = avatar),
            contentDescription = null,
            modifier = modifier,
            contentScale = ContentScale.Crop
        )
    } else {
        AsyncImage(
            model = avatar,
            contentDescription = null,
            modifier = modifier,
            contentScale = ContentScale.Crop
        )
    }
}
