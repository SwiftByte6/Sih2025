'use client'
import React, { useState, useEffect } from "react"
import { uploadMediaAndCreateReport } from "@/lib/reportService"

const CitizenReportForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    location: { lat: null, lng: null },
    media: null,
  })
  const [submitting, setSubmitting] = useState(false)

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
      const created = await uploadMediaAndCreateReport({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        location: formData.location,
        media: formData.media,
      })
      alert("Report submitted successfully ✅")
      setFormData({ title: "", type: "", description: "", location: formData.location, media: null })
    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Hazard</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Short title (e.g., Flooding near Marine Drive)"
            className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Hazard Type (schema-aligned) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-sky-400"
          >
            <option value="">Select Hazard</option>
            <option value="flood">🌧 Flood</option>
            <option value="cyclone">🌪 Cyclone/Storm</option>
            <option value="erosion">🏖 Erosion</option>
            <option value="pollution">🛢 Pollution</option>
            <option value="other">⚠️ Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Describe what you observed..."
            className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location (Auto)</label>
          {formData.location.lat && formData.location.lng ? (
            <p className="text-sm text-gray-600">
              📍 {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
            </p>
          ) : (
            <p className="text-sm text-red-500">⚠️ Location not available</p>
          )}
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo/Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100"
          />
          {formData.media && <p className="text-sm mt-1">Selected: {formData.media.name}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl py-2 font-medium shadow-md transition"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  )
}

export default CitizenReportForm
