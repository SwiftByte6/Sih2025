'use client'
import React, { useState, useEffect, useRef } from "react"
import { uploadMediaAndCreateReport } from "@/lib/reportService"
import { useToast } from "@/components/ToastProvider"
import { useI18n } from "@/contexts/I18nContext"

const CitizenReportForm = () => {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    title: "",
    type: "other", // Default to "other" as requested
    description: "",
    location: { lat: null, lng: null },
  })
  const [submitting, setSubmitting] = useState(false)
  const [locationError, setLocationError] = useState(false)
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  // Auto-fetch GPS
  useEffect(() => {
    requestLocation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMediaFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setMediaPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      setCameraError('Camera access denied. Please allow camera permission.')
      toast({ 
        title: 'Camera Error', 
        description: 'Unable to access camera. Please check permissions.', 
        variant: 'error' 
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setShowCamera(false)
    setCameraError(null)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          setMediaFile(file)
          setMediaPreview(URL.createObjectURL(blob))
          stopCamera()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          }))
          setLocationError(false)
        },
        (error) => {
          console.warn("Location access denied:", error.message)
          setLocationError(true)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.type || !formData.description) {
      toast({ title: 'Missing information', description: 'Please fill in all required fields.', variant: 'error' })
      return
    }
    
    // Validate location - location is optional but warn user
    if (!formData.location.lat || !formData.location.lng) {
      const proceed = confirm('Location is not available. Do you want to submit the report without location data?')
      if (!proceed) {
        return
      }
    }
    
    setSubmitting(true)

    try {
      // Only send location if we have valid coordinates
      const locationData = (formData.location.lat && formData.location.lng) ? formData.location : null
      
      await uploadMediaAndCreateReport({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        location: locationData,
        media: mediaFile,
      })

      toast({ title: 'Report submitted', description: 'Thank you for your contribution.', variant: 'success' })
      setFormData({ title: "", type: "other", description: "", location: formData.location })
      setMediaFile(null)
      setMediaPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Submission failed', description: err?.message || 'Failed to submit report', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
      
        
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('report.form.title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('report.form.title_placeholder', { default: 'Short title (e.g., Flooding near Marine Drive)' })}
                required
                className="w-full border-2 border-gray-200 rounded-xl p-4 bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('report.form.description')} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder={t('report.form.description_placeholder', { default: 'Describe about the hazard...' })}
                className="w-full border-2 border-gray-200 rounded-xl p-4 bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                required
              />
            </div>

            {/* Hazard Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('report.form.hazard_type')} <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl p-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg appearance-none bg-no-repeat bg-right bg-[length:20px] pr-12"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")' }}
                required
              >
                <option value="tsunami">{t('hazards.tsunami', { default: 'Tsunami' })}</option>
                <option value="storm_surge">{t('hazards.storm_surge', { default: 'Storm Surge' })}</option>
                <option value="high_waves">{t('hazards.high_waves', { default: 'High Waves' })}</option>
                <option value="swell_surge">{t('hazards.swell_surge', { default: 'Swell Surge' })}</option>
                <option value="coastal_current">{t('hazards.coastal_current', { default: 'Coastal Current' })}</option>
                <option value="flood">{t('hazards.flood', { default: 'Flood' })}</option>
                <option value="cyclone">{t('hazards.cyclone', { default: 'Cyclone' })}</option>
                <option value="erosion">{t('hazards.erosion', { default: 'Erosion' })}</option>
                <option value="pollution">{t('hazards.pollution', { default: 'Pollution' })}</option>
                <option value="abnormal_sea">{t('hazards.abnormal_sea', { default: 'Abnormal Sea Behavior' })}</option>
                <option value="other">{t('hazards.other', { default: 'Other' })}</option>
              </select>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                {t('report.form.media', { default: 'Add Photo/Video' })} <span className="text-gray-400">(Optional)</span>
              </label>
              
              {/* Media Preview */}
              {mediaPreview && (
                <div className="relative">
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img 
                      src={mediaPreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Interface */}
              {showCamera && (
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors font-semibold"
                    >
                      Capture
                    </button>
                  </div>
                </div>
              )}

              {/* Media Upload Buttons */}
              {!showCamera && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Camera</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Gallery</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {cameraError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                {t('report.form.map')} <span className="text-gray-400">(Optional)</span>
              </label>
              <div className={`w-full h-32 border-2 rounded-xl flex items-center justify-center text-sm transition-all duration-200 ${
                formData.location.lat && formData.location.lng 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                {formData.location.lat && formData.location.lng
                  ? (
                    <div className="text-center">
                      <div className="text-2xl mb-1">📍</div>
                      <div className="font-semibold">Location Detected</div>
                      <div className="text-xs">{formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}</div>
                    </div>
                  )
                  : (
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚠️</div>
                      <div className="font-semibold">Location not available</div>
                    </div>
                  )}
              </div>
              {(!formData.location.lat || !formData.location.lng) && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 flex-1">
                    {t('report.form.location_help', { default: 'Location will be automatically detected. If unavailable, you can still submit the report.' })}
                  </div>
                  {locationError && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 text-lg ${
                submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-200 hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('common.submitting', { default: 'Submitting...' })}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>{t('report.submit', { default: 'Submit Report' })}</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Hidden canvas for camera capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

export default CitizenReportForm
