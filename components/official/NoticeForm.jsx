'use client'
import { useState } from 'react'

export default function NoticeForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [region, setRegion] = useState('')
  const [expiry, setExpiry] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      region: region.trim() || null,
      expiry: expiry ? new Date(expiry).toISOString() : null,
    })
    setTitle('')
    setContent('')
    setRegion('')
    setExpiry('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="text-sm text-gray-700">Create Notice</div>
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Title</label>
        <input
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notice title"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Content</label>
        <textarea
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-600 min-h-[96px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the notice details"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Region (optional)</label>
        <input
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g., Mumbai"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Expiry (optional)</label>
        <input
          type="datetime-local"
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-600"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
        />
      </div>
      <button type="submit" className="w-full rounded-md bg-sky-600 hover:bg-sky-700 px-3 py-2 text-sm font-medium">
        Publish Notice
      </button>
    </form>
  )
}


