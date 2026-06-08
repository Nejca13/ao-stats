package com.example.myapplication.ui.viewmodel

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.myapplication.data.local.SessionManager
import com.example.myapplication.data.repository.AoRepository

class ViewModelFactory(
    private val application: Application,
    private val repository: AoRepository,
    private val sessionManager: SessionManager,
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(application, repository, sessionManager) as T
        }
        if (modelClass.isAssignableFrom(AsadoViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AsadoViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
