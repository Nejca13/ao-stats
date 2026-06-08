package com.example.myapplication.data.notifications

import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object NotificationHelper {
    private const val PERIODIC_WORK_NAME = "periodic_match_reminder"
    private const val SNOOZE_WORK_NAME = "snooze_match_reminder"

    fun schedulePeriodicNotification(context: Context) {
        val workManager = WorkManager.getInstance(context)
        val request = PeriodicWorkRequestBuilder<NotificationWorker>(
            15, TimeUnit.MINUTES
        ).build()

        workManager.enqueueUniquePeriodicWork(
            PERIODIC_WORK_NAME,
            ExistingPeriodicWorkPolicy.CANCEL_AND_REENQUEUE,
            request
        )
    }

    fun cancelPeriodicNotification(context: Context) {
        val workManager = WorkManager.getInstance(context)
        workManager.cancelUniqueWork(PERIODIC_WORK_NAME)
        workManager.cancelUniqueWork(SNOOZE_WORK_NAME)
    }

    fun scheduleSnooze(context: Context) {
        val workManager = WorkManager.getInstance(context)
        val request = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setInitialDelay(2, TimeUnit.MINUTES)
            .build()

        workManager.enqueueUniqueWork(
            SNOOZE_WORK_NAME,
            ExistingWorkPolicy.REPLACE,
            request
        )
    }
}
