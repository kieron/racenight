export async function onRequestPost({ request, env }) {
  const formData = await request.formData()
  const name = formData.get('name')
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  // Check if we've already reached 50 submissions
  const list = await env.SUBMISSIONS.list({ prefix: 'submission:' })
  if (list.keys.length >= 4) {
    return new Response(JSON.stringify({ error: 'Submission limit reached' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }

  const timestamp = Date.now()
  const key = `submission:${timestamp}`
  const submission = { name, timestamp }
  await env.SUBMISSIONS.put(key, JSON.stringify(submission))
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
}
