export async function onRequestGet({ env }) {
  const list = await env.SUBMISSIONS.list({ prefix: 'submission:' })
  const submissions = []
  for (const key of list.keys) {
    const data = await env.SUBMISSIONS.get(key.name)
    if (data) {
      try {
        submissions.push(JSON.parse(data))
      }
      catch (e) {
        // Ignore invalid JSON
      }
    }
  }
  submissions.sort((a, b) => a.timestamp - b.timestamp)
  return new Response(JSON.stringify({ submissions }), { headers: { 'Content-Type': 'application/json' } })
}
