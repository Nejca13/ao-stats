'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  IconUpload,
  IconArrowLeft,
  IconLoader2,
  IconTrash,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react'
import s from './upload.module.css'

export default function UploadTeamLogoPage() {
  const [teamName, setTeamName] = useState('')
  const [teamId, setTeamId] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const fileInputRef = useRef(null)

  const handleNameChange = (e) => {
    const val = e.target.value
    setTeamName(val)

    const normalized = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    setTeamId(normalized)
  }

  const handleIdChange = (e) => {
    setTeamId(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, ''))
  }

  const handleFile = (selectedFile) => {
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setStatus({
        type: 'error',
        message: 'Por favor, selecciona solo archivos de imagen (PNG, JPG, WEBP, etc.)'
      })
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(selectedFile)
    setStatus(null)
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !teamId) return

    setLoading(true)
    setStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('teamId', teamId)
      formData.append('teamName', teamName)

      const response = await fetch('/api/ao/teams/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Ocurrio un error al subir el archivo.')
      }

      setStatus({
        type: 'success',
        message: 'Escudo subido con exito!',
        data: result.data
      })

      setTeamName('')
      setTeamId('')
      setFile(null)
      setPreviewUrl('')
    } catch (err) {
      console.error(err)
      setStatus({
        type: 'error',
        message: err.message || 'Error de conexion con el servidor.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.uploadWrapper}>
      <div className={s.container}>
        <Link href="/stats" className={s.backLink}>
          <IconArrowLeft size={16} /> Volver a estadisticas
        </Link>

        <div className={s.card}>
          <h1 className={s.title}>Subir Escudo de Equipo</h1>
          <p className={s.subtitle}>
            Sube el logotipo o escudo de un nuevo equipo directamente a Cloudinary para usarlo en la plataforma.
          </p>

          {status && (
            <div className={`${s.alert} ${status.type === 'success' ? s.alertSuccess : s.alertError}`}>
              {status.type === 'success' ? (
                <IconCheck size={20} style={{ flexShrink: 0 }} />
              ) : (
                <IconAlertCircle size={20} style={{ flexShrink: 0 }} />
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{status.message}</p>
                {status.type === 'success' && status.data && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                    URL: <a href={status.data.secureUrl} target="_blank" rel="noreferrer" className={s.alertLink}>
                      {status.data.secureUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="teamName">Nombre del Equipo</label>
              <input
                className={s.input}
                type="text"
                id="teamName"
                placeholder="Ej: UCD Dublin"
                value={teamName}
                onChange={handleNameChange}
                required
                disabled={loading}
              />
            </div>

            <div className={s.formGroup}>
              <label className={s.label} htmlFor="teamId">ID de Equipo (Nombre archivo Cloudinary)</label>
              <input
                className={s.input}
                type="text"
                id="teamId"
                placeholder="Ej: ucd-dublin"
                value={teamId}
                onChange={handleIdChange}
                required
                disabled={loading}
              />
              <span style={{ fontSize: '0.75rem', color: 'rgba(251, 217, 173, 0.4)', marginTop: '4px', display: 'block' }}>
                Solo se permiten letras, numeros, guiones y espacios.
              </span>
            </div>

            <div className={s.formGroup}>
              <label className={s.label}>Escudo / Logo (Imagen)</label>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={loading}
              />

              {!previewUrl ? (
                <div
                  className={`${s.dropzone} ${isDragActive ? s.dropzoneActive : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className={s.dropzoneIcon} />
                  <p className={s.dropzoneText}>Arrastra una imagen aqui o haz clic para buscar</p>
                  <p className={s.dropzoneHint}>PNG, JPG o WEBP recomendados</p>
                </div>
              ) : (
                <div className={s.previewContainer}>
                  <div className={s.previewWrapper}>
                    <img src={previewUrl} alt="Vista previa del escudo" className={s.previewImage} />
                  </div>
                  <button type="button" onClick={removeFile} className={s.removeButton} disabled={loading}>
                    <IconTrash size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Quitar escudo
                  </button>
                </div>
              )}
            </div>

            <button
              className={s.submitBtn}
              type="submit"
              disabled={loading || !file || !teamId}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <IconLoader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Subiendo escudo...
                </span>
              ) : (
                'Subir a Cloudinary'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
