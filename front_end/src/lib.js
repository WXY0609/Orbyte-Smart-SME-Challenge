export const money = (amount) => `RM ${Number(amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const dateTime = (value) => value ? new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : 'Not yet updated';
export const dateLabel = (date) => new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00+08:00`));
export const windowLabel = (target) => `${target.date} · ${target.start}–${target.end} MYT`;
export const localNow = () => new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 16);
export const labels = { conditions_met: 'Known conditions met', conflict: 'Conditions conflict', insufficient_data: 'More information needed', draft: 'Draft', approved: 'Approved', needs_review: 'Review required', in_progress: 'In progress', waiting_reply: 'Simulated sent · awaiting reply', completed: 'Completed' };
export const refHref = (ref) => `#${({ plan: 'plans', event: 'events', confirmation: 'confirmations', action: 'actions', business: 'profile', weather: 'events' })[ref.type] || 'overview'}:${ref.id}`;

export async function api(mode, path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), path.includes('/copilot/chat') ? 105000 : 35000);
  try {
    const response = await fetch(`/api${path}`, { ...options, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-Workspace': mode, ...options.headers },
      body: options.body === undefined ? undefined : JSON.stringify(options.body) });
    const payload = await response.json().catch(() => { throw new Error('Cannot reach the backend. Start Flask on port 5000 and retry.'); });
    if (!response.ok) {
      const error = new Error(payload.error || 'The request could not be completed.');
      error.state = payload.state;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Any saved drafts are still available; refresh before retrying.');
    if (error instanceof TypeError) throw new Error('Cannot reach the backend. Check the connection and retry.');
    throw error;
  } finally { clearTimeout(timer); }
}
