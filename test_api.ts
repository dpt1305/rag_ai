const prompt = process.argv[2] || 'iPhone 15 Pro Max'

async function test() {
  console.log(`--- TESTING API ENDPOINT WITH PROMPT: "${prompt}" ---`)
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    console.log('Response status:', res.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
  } catch (err: any) {
    console.error('Fetch error:', err.message)
  }
}

test()
