package com.example.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.AoOrange

@Composable
fun CustomDialog(
    onDismissRequest: () -> Unit,
    title: String,
    content: @Composable () -> Unit,
    confirmButton: @Composable () -> Unit,
    dismissButton: @Composable (() -> Unit)? = null
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = {
            Text(
                text = title,
                color = AoOrange,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = content,
        confirmButton = confirmButton,
        dismissButton = dismissButton,
        containerColor = Color(0xFF1C1C1E),
        titleContentColor = AoOrange,
        textContentColor = Color.White
    )
}
