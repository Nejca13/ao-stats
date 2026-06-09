package com.example.myapplication.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.AoDarkGray
import com.example.myapplication.ui.theme.AoGray
import com.example.myapplication.ui.theme.AoOrange

// ──────────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────────

data class LegalSection(val title: String, val body: String)

private val privacySections = listOf(
    LegalSection(
        "1. Responsable del tratamiento",
        "AO Stats es operada por Nicolás Contreras. Los datos personales recabados serán tratados conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina y el Reglamento General de Protección de Datos (RGPD) de la Unión Europea cuando corresponda."
    ),
    LegalSection(
        "2. Datos que recopilamos",
        "• Datos de cuenta: nombre, dirección de correo electrónico e identificador único provistos por Google al iniciar sesión.\n" +
        "• Datos de uso: información sobre los torneos, partidos, jugadores y estadísticas que creás dentro de la aplicación.\n" +
        "• Datos del dispositivo: modelo, sistema operativo y versión de la aplicación (solo Android).\n" +
        "• Imágenes: las fotos de escudos y partidos que subís voluntariamente a través de la aplicación."
    ),
    LegalSection(
        "3. Finalidad del tratamiento",
        "Tus datos se utilizan exclusivamente para:\n" +
        "• Autenticar tu identidad mediante Google.\n" +
        "• Permitir la creación y gestión de torneos, jugadores y partidos.\n" +
        "• Sincronizar tus datos entre dispositivos.\n" +
        "• Mejorar la aplicación en base a patrones de uso agregados.\n" +
        "• Enviar comunicaciones técnicas (actualizaciones, cambios en Términos)."
    ),
    LegalSection(
        "4. Base legal",
        "El tratamiento se basa en:\n" +
        "• Consentimiento: al utilizar la aplicación y aceptar estos Términos, consentís el tratamiento de tus datos.\n" +
        "• Ejecución del servicio: el tratamiento es necesario para proveer la funcionalidad de la aplicación."
    ),
    LegalSection(
        "5. Almacenamiento y seguridad",
        "Tus datos se almacenan en servidores de MongoDB Atlas (Google Cloud, región us-east) y Vercel (AWS, región us-east). Implementamos:\n" +
        "• Cifrado en tránsito (TLS 1.3).\n" +
        "• Cifrado en reposo de la base de datos.\n" +
        "• Tokens JWT firmados para sesiones.\n" +
        "• Acceso restringido a la base de datos por IP y credenciales."
    ),
    LegalSection(
        "6. Conservación de datos",
        "Conservamos tus datos mientras tu cuenta esté activa. Si solicitás la baja, los datos se eliminarán en un plazo máximo de 30 días. Las imágenes subidas a Cloudinary se conservan hasta que las eliminés o solicites la baja de tu cuenta."
    ),
    LegalSection(
        "7. Compartición de datos",
        "No compartimos tus datos personales con terceros, excepto:\n" +
        "• Google: para la autenticación (Google Sign-In).\n" +
        "• Cloudinary: para el almacenamiento de imágenes.\n" +
        "• Mercado Pago: para el procesamiento de pagos (únicamente si adquirís un plan premium).\n" +
        "• Cuando sea requerido por ley o autoridad competente."
    ),
    LegalSection(
        "8. Tus derechos",
        "Tenés derecho a:\n" +
        "• Acceder a tus datos personales.\n" +
        "• Rectificar datos inexactos.\n" +
        "• Solicitar la supresión de tus datos.\n" +
        "• Oponerte al tratamiento.\n" +
        "• Portar tus datos a otro servicio.\n" +
        "• Retirar tu consentimiento en cualquier momento.\n\n" +
        "Para ejercer estos derechos, contactanos a través de la sección Ayuda."
    ),
    LegalSection(
        "9. Transferencias internacionales",
        "Tus datos pueden ser transferidos y almacenados en servidores ubicados en Estados Unidos. Al utilizar la aplicación, consentís esta transferencia. Se aplican las garantías adecuadas mediante cláusulas contractuales tipo."
    ),
    LegalSection(
        "10. Cambios a esta política",
        "Notificaremos cambios sustanciales a través de la aplicación o por correo electrónico. El uso continuado implica la aceptación de la política actualizada."
    ),
    LegalSection(
        "11. Contacto",
        "Para consultas, contactanos a través de la sección Ayuda de la aplicación o abriendo un issue en nuestro repositorio de GitHub."
    ),
)

private val termsSections = listOf(
    LegalSection(
        "1. Aceptación de los términos",
        "Al acceder o utilizar AO Stats, aceptás los presentes Términos y Condiciones. Si no estás de acuerdo, no utilices la aplicación. La aplicación es operada por Nicolás Contreras y está sujeta a la legislación de la República Argentina."
    ),
    LegalSection(
        "2. Descripción del servicio",
        "AO Stats es una plataforma que permite organizar torneos de fútbol virtual, " +
        "registrar partidos, calcular estadísticas (ELO, ranking, MVPs) y gestionar grupos de jugadores. El servicio se ofrece en:\n" +
        "• Plan gratuito: funcionalidades básicas con limitaciones en la cantidad de asados y partidos.\n" +
        "• Planes premium: funcionalidades avanzadas sin limitaciones, mediante suscripción mensual."
    ),
    LegalSection(
        "3. Requisitos de uso",
        "Para utilizar la aplicación debés:\n" +
        "• Ser mayor de 13 años.\n" +
        "• Tener una cuenta de Google válida para autenticación.\n" +
        "• Contar con conexión a internet para la sincronización inicial y periódica."
    ),
    LegalSection(
        "4. Registro y cuenta",
        "El registro se realiza exclusivamente a través de Google Sign-In. Sos responsable de mantener la confidencialidad de tu cuenta de Google. La aplicación no almacena contraseñas; la autenticación es delegada a Google."
    ),
    LegalSection(
        "5. Uso responsable",
        "Te comprometés a:\n" +
        "• No utilizar la aplicación para fines ilegales o no autorizados.\n" +
        "• No introducir datos falsos, ofensivos o que violen derechos de terceros.\n" +
        "• No intentar acceder a datos de otros usuarios o vulnerar la seguridad del sistema.\n" +
        "• No realizar un uso abusivo de los recursos del servidor.\n\n" +
        "El incumplimiento puede resultar en la suspensión o eliminación de tu cuenta sin previo aviso."
    ),
    LegalSection(
        "6. Propiedad intelectual",
        "El código, diseño, logotipos y contenido de la aplicación son propiedad de Nicolás Contreras. Los datos que ingresás (nombres de jugadores, resultados, imágenes) te pertenecen, y nos otorgás una licencia para almacenarlos y mostrarlos dentro de la aplicación."
    ),
    LegalSection(
        "7. Privacidad y datos personales",
        "El tratamiento de tus datos personales se rige por nuestra Política de Privacidad. Al utilizar la aplicación, declarás haber leído y comprendido dicha política."
    ),
    LegalSection(
        "8. Limitación de responsabilidad",
        "La aplicación se proporciona «tal cual» y «según disponibilidad». No garantizamos que el servicio sea ininterrumpido o libre de errores. En la máxima medida permitida por la ley, el operador no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la aplicación."
    ),
    LegalSection(
        "9. Cancelación y baja",
        "Podés dejar de utilizar la aplicación en cualquier momento. Para solicitar la eliminación de tu cuenta y datos, contactanos a través de la sección de Ayuda. El operador se reserva el derecho de suspender o terminar el acceso a usuarios que violen estos términos."
    ),
    LegalSection(
        "10. Suscripciones y pagos",
        "Los planes premium se gestionan a través de Mercado Pago. Los pagos son procesados por Mercado Pago y están sujetos a sus propios términos y condiciones. Las suscripciones se renuevan automáticamente cada mes. Podés cancelar en cualquier momento desde la sección Cuenta del panel de control."
    ),
    LegalSection(
        "11. Modificaciones",
        "Estos términos pueden ser modificados en cualquier momento. Notificaremos los cambios a través de la aplicación o por correo electrónico. El uso continuado del servicio después de las modificaciones constituye la aceptación de los nuevos términos."
    ),
    LegalSection(
        "12. Ley aplicable y jurisdicción",
        "Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero o jurisdicción."
    ),
    LegalSection(
        "13. Contacto",
        "Para consultas sobre estos términos, contactanos a través de la sección de Ayuda de la aplicación o abriendo un issue en nuestro repositorio de GitHub."
    ),
)

// ──────────────────────────────────────────────────────────────────────────────
// Legal Index Screen
// ──────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LegalScreen(
    onNavigateToTerms: () -> Unit,
    onNavigateToPrivacy: () -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Legal") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 20.dp)
        ) {
            item {
                Text(
                    text = "Documentación legal que rige el uso de AO Stats.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            item {
                LegalNavCard(
                    icon = Icons.Default.Description,
                    title = "Términos y Condiciones",
                    subtitle = "Reglas de uso, limitaciones y planes premium",
                    onClick = onNavigateToTerms
                )
            }

            item {
                LegalNavCard(
                    icon = Icons.Default.Shield,
                    title = "Política de Privacidad",
                    subtitle = "Cómo usamos y protegemos tus datos personales",
                    onClick = onNavigateToPrivacy
                )
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = AoDarkGray),
                    shape = MaterialTheme.shapes.large
                ) {
                    Text(
                        text = "Última actualización: 8 de junio de 2026\n\n" +
                               "Si tenés preguntas sobre estos documentos o necesitás ejercer derechos sobre tus datos, " +
                               "usá la sección Ayuda de la app.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        modifier = Modifier.padding(16.dp),
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun LegalNavCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = AoDarkGray),
        shape = MaterialTheme.shapes.large
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(AoOrange.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = AoOrange, modifier = Modifier.size(22.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 15.sp)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = Color.Gray, lineHeight = 18.sp)
            }
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = Color.Gray)
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Shared legal document viewer
// ──────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LegalDocScreen(
    title: String,
    subtitle: String,
    updatedAt: String,
    sections: List<LegalSection>,
    onBack: () -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Column(modifier = Modifier.padding(bottom = 8.dp)) {
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
                        lineHeight = 22.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Última actualización: $updatedAt",
                        style = MaterialTheme.typography.labelSmall,
                        color = AoOrange.copy(alpha = 0.7f)
                    )
                }
            }

            items(sections) { section ->
                LegalSectionCard(section)
            }
        }
    }
}

@Composable
private fun LegalSectionCard(section: LegalSection) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = AoDarkGray),
        shape = MaterialTheme.shapes.large
    ) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = section.title,
                fontWeight = FontWeight.Bold,
                color = AoOrange,
                fontSize = 14.sp
            )
            Text(
                text = section.body,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
                lineHeight = 22.sp
            )
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Privacy & Terms convenience wrappers
// ──────────────────────────────────────────────────────────────────────────────

@Composable
fun PrivacyDocScreen(onBack: () -> Unit) {
    LegalDocScreen(
        title = "Política de Privacidad",
        subtitle = "Cómo recopilamos, usamos y protegemos tus datos personales conforme a la Ley 25.326 y el RGPD.",
        updatedAt = "8 de junio de 2026",
        sections = privacySections,
        onBack = onBack
    )
}

@Composable
fun TermsDocScreen(onBack: () -> Unit) {
    LegalDocScreen(
        title = "Términos y Condiciones",
        subtitle = "Leé atentamente las condiciones que rigen el uso de AO Stats.",
        updatedAt = "8 de junio de 2026",
        sections = termsSections,
        onBack = onBack
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// Terms acceptance dialog (shown before first Google Sign-In)
// ──────────────────────────────────────────────────────────────────────────────

@Composable
fun TermsAcceptanceDialog(
    onAccept: () -> Unit,
    onDecline: () -> Unit,
    onViewTerms: () -> Unit,
    onViewPrivacy: () -> Unit,
) {
    var checked by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDecline,
        containerColor = AoDarkGray,
        title = {
            Text(
                "Antes de continuar",
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    "Para usar AO Stats necesitás aceptar nuestros documentos legales.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray,
                    lineHeight = 22.sp
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onViewTerms,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = AoOrange),
                        border = androidx.compose.foundation.BorderStroke(1.dp, AoOrange.copy(alpha = 0.5f)),
                        shape = MaterialTheme.shapes.medium,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp)
                    ) {
                        Text("Términos", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                    OutlinedButton(
                        onClick = onViewPrivacy,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = AoOrange),
                        border = androidx.compose.foundation.BorderStroke(1.dp, AoOrange.copy(alpha = 0.5f)),
                        shape = MaterialTheme.shapes.medium,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp)
                    ) {
                        Text("Privacidad", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }

                HorizontalDivider(color = Color.Gray.copy(alpha = 0.2f))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { checked = !checked }
                        .padding(vertical = 4.dp)
                ) {
                    Checkbox(
                        checked = checked,
                        onCheckedChange = { checked = it },
                        colors = CheckboxDefaults.colors(
                            checkedColor = AoOrange,
                            uncheckedColor = Color.Gray,
                            checkmarkColor = Color.White
                        )
                    )
                    Text(
                        "Leí y acepto los Términos y Condiciones y la Política de Privacidad",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White,
                        lineHeight = 18.sp
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onAccept,
                enabled = checked,
                colors = ButtonDefaults.buttonColors(
                    containerColor = AoOrange,
                    disabledContainerColor = AoOrange.copy(alpha = 0.3f)
                ),
                shape = MaterialTheme.shapes.medium
            ) {
                Text("Aceptar y continuar", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDecline,
                colors = ButtonDefaults.textButtonColors(contentColor = Color.Gray)
            ) {
                Text("Cancelar")
            }
        }
    )
}
