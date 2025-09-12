'use client'
import React, { useState, useEffect } from "react"
import { uploadMediaAndCreateReport } from "@/lib/reportService"
import { useToast } from "@/components/ToastProvider"
import { useI18n } from "@/contexts/I18nContext"

const CitizenReportForm = () => {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    location: { lat: null, lng: null },
    media: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Auto-fetch GPS
  useEffect(() => {
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
        },
        () => console.warn("Location access denied")
      )
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, media: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await uploadMediaAndCreateReport({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        location: formData.location,
        media: formData.media,
      })
      toast({ title: 'Report submitted', description: 'Thank you for your contribution.', variant: 'success' })
      setFormData({ title: "", type: "", description: "", location: formData.location, media: null })
    } catch (err) {
      console.error(err)
      toast({ title: 'Submission failed', description: err?.message || 'Failed to submit report', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 mx-auto bg-[#F8FCFF] shadow-md border rounded-xl">
      <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">{t('report.title', { default: 'Report a Hazard' })}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.form.title')}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t('report.form.title_placeholder', { default: 'Short title (e.g., Flooding near Marine Drive)' })}
            required
            className="w-full border border-gray-300 rounded-xl p-2 bg-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.form.media')}</label>
          <div className="flex gap-3">
            <label className="flex-1">
              <span className="sr-only">{t('report.form.camera')}</span>
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-full text-center py-2 bg-white border rounded-full shadow-sm text-gray-700 cursor-pointer hover:bg-gray-50">{t('report.form.camera')}</div>
            </label>
            <label className="flex-1">
              <span className="sr-only">{t('report.form.gallery')}</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-full text-center py-2 bg-white border rounded-full shadow-sm text-gray-700 cursor-pointer hover:bg-gray-50">{t('report.form.gallery')}</div>
            </label>
          </div>
          {formData.media && (
            <p className="text-sm text-gray-500 mt-1">{t('report.form.selected', { default: 'Selected:' })} {formData.media.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.form.description')}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder={t('report.form.description_placeholder', { default: 'Describe about the hazard...' })}
            className="w-full border border-gray-300 rounded-xl p-2 bg-[#E6F0FF] placeholder-gray-400 focus:ring-2 focus:ring-sky-400"
            required
          />
        </div>

        {/* Hazard Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.form.hazard_type')}</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "high_tides", label: t('hazards.high_waves', { default: 'High Tides' }) },
              { value: "flood", label: t('hazards.flood', { default: 'Flooding' }) },
              { value: "tsunami", label: t('hazards.tsunami', { default: 'Tsunami' }) },
              { value: "pollution", label: t('hazards.pollution', { default: 'Pollution' }) },
            ].map((hazard) => (
              <label
                key={hazard.value}
                className="flex items-center justify-between px-3 py-2 border rounded-xl bg-white text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                {hazard.label}
                <input
                  type="radio"
                  name="type"
                  value={hazard.value}
                  checked={formData.type === hazard.value}
                  onChange={handleChange}
                  className="w-4 h-4 text-sky-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Map (Location Preview) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.form.map')}</label>
          <div className="w-full h-28 border rounded-xl bg-white flex items-center justify-center text-gray-400 text-sm">
            {formData.location.lat && formData.location.lng
              ? `📍 ${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`
              : t('report.form.location_unavailable', { default: '⚠️ Location not available' })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#D9EFFF] hover:bg-[#C6E0FF] text-sky-700 font-medium py-2 rounded-xl shadow-md transition"
        >
          {submitting ? t('common.submitting', { default: 'Submitting...' }) : t('report.submit', { default: 'Report Hazard' })}
        </button>
      </form>
    </div>
  )
}

export default CitizenReportForm
