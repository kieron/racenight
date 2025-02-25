export async function onRequestPost({ request, env }) {
  const formData = await request.formData()
  const name = formData.get('name')
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Get user's IP from request headers
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'

  // Check if this IP has submitted in the last 24 hours
  const lastSubmission = await env.SUBMISSIONS.get(`last:${ip}`)
  if (lastSubmission) {
    const lastTimestamp = parseInt(lastSubmission, 10)
    if (Date.now() - lastTimestamp < 86400000) {
      return new Response(JSON.stringify({ error: 'You can only submit once per day' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  // Process submission
  const timestamp = Date.now()
  // Create a unique key for the submission (including the IP helps ensure uniqueness)
  const key = `submission:${timestamp}-${ip}`
  const submission = { name, timestamp, ip }
  await env.SUBMISSIONS.put(key, JSON.stringify(submission))
  
  // Record the submission time for this IP, with a TTL of 24 hours (86400 seconds)
  await env.SUBMISSIONS.put(`last:${ip}`, String(timestamp), { expirationTtl: 86400 })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
