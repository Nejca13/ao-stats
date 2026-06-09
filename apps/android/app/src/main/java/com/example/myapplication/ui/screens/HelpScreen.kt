package com.example.myapplication.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.AoDarkGray
import com.example.myapplication.ui.theme.AoOrange

@Composable
fun HelpScreen(onNavigateToLegal: () -> Unit = {}) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        item {
            Column(modifier = Modifier.padding(bottom = 8.dp)) {
                Text(
                    text = "Guía de la App",
                    style = MaterialTheme.typography.headlineMedium,
                    color = AoOrange,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "Entendé cómo funcionan los puntos, el ELO y las estadísticas.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
            }
        }

        item {
            HelpCard(
                icon = Icons.Default.BarChart,
                title = "Sistema de Puntos (Global)",
                description = "Los puntos se acumulan jornada tras jornada (asado por asado). Tu puntaje total en el ranking global es la suma de los puntos obtenidos en cada evento en el que participaste."
            )
        }

        item {
            HelpCard(
                icon = Icons.Default.Whatshot,
                title = "Puntos por Asado",
                description = "En cada jornada, los puntos se reparten según tu posición final:\n• #1 (Campeón): 10 puntos.\n• Último puesto: 1 punto.\n• El resto: Escala lineal entre 10 y 1 basada en la cantidad de participantes."
            )
        }

        item {
            HelpCard(
                icon = Icons.Default.Stars,
                title = "Rangos y ELO",
                description = "Tu nivel se mide por rangos de ELO (Base 1500):\n• Diamante: 1700+\n• Épico: 1600-1699\n• Oro: 1500-1599\n• Plata: 1400-1499\n• Bronce: < 1400"
            )
        }

        item {
            HelpCard(
                icon = Icons.Default.EmojiEvents,
                title = "MVP y Especiales",
                description = "• MVP de Jornada: Se lo lleva el jugador que termine en la posición #1 del asado.\n• MVP Histórico: Quien haya sido #1 más veces en la historia.\n• Víctima/Némesis: Basado puramente en tu historial de enfrentamientos directos (Head-to-Head)."
            )
        }

        item {
            HelpCard(
                icon = Icons.Default.Notifications,
                title = "Recordatorios",
                description = "Recibirás notificaciones importantes sobre los próximos asados y actualizaciones de ranking."
            )
        }

        item {
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToLegal() },
                colors = CardDefaults.cardColors(containerColor = AoDarkGray),
                shape = MaterialTheme.shapes.large
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Gavel,
                        contentDescription = null,
                        tint = AoOrange,
                        modifier = Modifier.size(24.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Información Legal",
                            fontWeight = FontWeight.Bold,
                            color = androidx.compose.ui.graphics.Color.White,
                            fontSize = 18.sp
                        )
                        Text(
                            text = "Términos y Condiciones · Política de Privacidad",
                            style = MaterialTheme.typography.bodySmall,
                            color = androidx.compose.ui.graphics.Color.Gray
                        )
                    }
                    Icon(
                        Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null,
                        tint = androidx.compose.ui.graphics.Color.Gray
                    )
                }
            }
        }
    }
}

@Composable
fun HelpCard(icon: ImageVector, title: String, description: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = AoDarkGray),
        shape = MaterialTheme.shapes.large
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = icon, 
                    contentDescription = null, 
                    tint = AoOrange, 
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 18.sp
                )
            }
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.9f),
                lineHeight = 22.sp
            )
        }
    }
}
