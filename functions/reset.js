export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url)
  // Require a secret key in the query string to authorize the reset
  const token = searchParams.get('token')
  if (token !== 'your-secret-key') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }

  // List all keys with the 'submission:' prefix
  const list = await env.SUBMISSIONS.list({ prefix: 'submission:' })
  const keys = list.keys
  for (const key of keys) {
    await env.SUBMISSIONS.delete(key.name)
  }
  return new Response(JSON.stringify({ success: true, cleared: keys.length }), { headers: { 'Content-Type': 'application/json' } })
}
