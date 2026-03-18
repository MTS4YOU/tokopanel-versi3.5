import { debugSendEmail } from '@/app/actions/debug-email'

export default function DebugPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>SMTP Debug</h1>

      <form action={debugSendEmail} style={{ display: 'grid', gap: 10, maxWidth: 400 }}>
        <input name="to" placeholder="Email" required />
        <input name="idtransaksi" placeholder="Transaction ID" required />
        <input name="username" placeholder="Username" required />
        <input name="password" placeholder="Password" required />
        <input name="serverId" placeholder="Server ID" required />
        <input name="planName" placeholder="Plan" required />

        <select name="serverType">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button type="submit">TEST SEND</button>
      </form>
    </div>
  )
}
