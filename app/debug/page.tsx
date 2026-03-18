'use client'

import { useState } from 'react'
import { sendPanelDetailsEmail } from '@/lib/email-service'

export default function DebugEmailPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [form, setForm] = useState({
    to: '',
    idtransaksi: '',
    username: '',
    password: '',
    serverId: '',
    planName: '',
    serverType: 'public',
  })

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await sendPanelDetailsEmail(
        form.to,
        form.idtransaksi,
        form.username,
        form.password,
        Number(form.serverId),
        form.planName,
        form.serverType as 'public' | 'private'
      )

      setResult(res)
    } catch (err) {
      setResult({ success: false, error: 'Client error' })
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>SMTP Debug Page</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, maxWidth: 400 }}>
        <input name="to" placeholder="Email Tujuan" onChange={handleChange} required />
        <input name="idtransaksi" placeholder="Transaction ID" onChange={handleChange} required />
        <input name="username" placeholder="Username Panel" onChange={handleChange} required />
        <input name="password" placeholder="Password Panel" onChange={handleChange} required />
        <input name="serverId" placeholder="Server ID" onChange={handleChange} required />
        <input name="planName" placeholder="Nama Paket" onChange={handleChange} required />

        <select name="serverType" onChange={handleChange}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'TEST SEND EMAIL'}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: '#eee', padding: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
