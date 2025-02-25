export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (token !== 'your-secret-key') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Delete submission keys
  const submissionList = await env.SUBMISSIONS.list({ prefix: 'submission:' })
  for (const key of submissionList.keys) {
    await env.SUBMISSIONS.delete(key.name)
  }

  // Delete IP submission block keys
  const lastList = await env.SUBMISSIONS.list({ prefix: 'last:' })
  for (const key of lastList.keys) {
    await env.SUBMISSIONS.delete(key.name)
  }

  return new Response(
    JSON.stringify({
      success: true,
      clearedSubmissions: submissionList.keys.length,
      clearedIPBlocks: lastList.keys.length
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
