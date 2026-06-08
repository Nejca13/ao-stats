package com.example.myapplication.data.notifications

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class NotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        
        if (action == "SNOOZE_ACTION") {
            snoozeNotification(context)
            return
        }
    }

    private fun snoozeNotification(context: Context) {
        NotificationHelper.scheduleSnooze(context)
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(NotificationWorker.NOTIFICATION_ID)
    }
}
