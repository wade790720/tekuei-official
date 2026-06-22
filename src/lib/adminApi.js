import { ADMIN_API_URL } from '../data/admin.js'

function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function loginAdmin(password) {
  const res = await fetch(`${ADMIN_API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || '登入失敗')
  }
  return data
}

export async function fetchAboutContent() {
  const res = await fetch(`${ADMIN_API_URL}/api/content/about`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch about content')
  }
  return res.json()
}

export async function saveAboutContent(content, token) {
  const res = await fetch(`${ADMIN_API_URL}/api/admin/content/about`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(content),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || '儲存失敗')
  }
  return data
}

export async function uploadAboutImage(slot, file, token) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${ADMIN_API_URL}/api/admin/media/about/${slot}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || '上傳失敗')
  }
  return data
}
