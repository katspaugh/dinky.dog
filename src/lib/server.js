const HEADERS = {
  'content-type': 'application/json;charset=UTF-8',
  //"Access-Control-Allow-Origin":"*",
  'Access-Control-Allow-Methods': 'GET, POST',
}

const ALLOWED_ORIGINS = ['https://dinky.dog', 'http://localhost:8080']

const USER_API_URL = 'https://api.github.com/user'

async function putState(id, userId, data) {
  return DINKY_STATE.put(`${userId}:${id}`, data, {
    metadata: {
      timestamp: Date.now(),
      userId,
    },
  })
}

async function getState(id) {
  return DINKY_STATE.getWithMetadata(id)
}

async function getByUser(userId) {
  return DINKY_STATE.list({ prefix: userId + ':' })
}

function checkHash(hash) {
  try {
    atob(hash)
  } catch {
    return false
  }
  return true
}

async function fetchUserData(token) {
  const response = await fetch(USER_API_URL, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to get user')
  }
  return await response.json()
}

async function getUser(request) {
  const auth = request.headers.get('authorization')
  if (!auth) {
    throw new Error('No authorization header')
  }
  return await fetchUserData()
}

async function handleRequest(request) {
  const responseHeaders = { ...HEADERS }

  const referer = request.headers.get('Referer')
  if (!referer || !ALLOWED_ORIGINS.some((origin) => referer.startsWith(origin))) {
    return new Response('Access denied', { status: 403 })
  }

  const origin = request.headers.get('Origin')
  if (ALLOWED_ORIGINS.includes(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin
  }

  if (request.method === 'POST') {
    let user
    try {
      user = await getUser(request)
    } catch (e) {
      return new Response(JSON.stringify({ status: 401, error: e.message }), {
        headers: responseHeaders,
        status: 401,
      })
    }

    const req = await request.json()

    if (!checkHash(req['data'])) {
      return new Response(`{"status": 401, "error": "Bad data"}`, {
        headers: responseHeaders,
        status: 401,
      })
    }

    const stat = await putState(req['id'], user.id, req['data'])
    console.log('Stat', stat)
    if (typeof stat === 'undefined') {
      return new Response(`{"status": 200, "key": "${req['id']}"}`, {
        headers: responseHeaders,
      })
    }
    return new Response(`{"status": 200, "error": "Reached the KV write limitation."}`, {
      headers: responseHeaders,
    })
  } else if (request.method === 'OPTIONS') {
    return new Response(``, {
      headers: responseHeaders,
    })
  }

  // Read the key query param
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    try {
      const { value, metadata } = await getState(id)
      responseHeaders['ETag'] = `W/${(metadata || {}).timestamp || Date.now()}`
      return new Response(JSON.stringify({ data: value }), {
        headers: responseHeaders,
      })
    } catch (e) {
      return new Response('Not found', {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
        status: 404,
      })
    }
  } else {
    let userData
    try {
      const user = await getUser(request)
      userData = await getByUser(user.id)
    } catch (e) {
      return new Response(JSON.stringify({ status: 401, error: e.message }), {
        headers: responseHeaders,
        status: 401,
      })
    }
    return new Response(JSON.stringify({ userData }), {
      headers: responseHeaders,
    })
  }
}

addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(event.request))
})
