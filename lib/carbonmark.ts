export function carbonmarkBaseUrl() {
  return (process.env.CARBONMARK_BASE_URL || "https://v17.api.carbonmark.com").replace(/\/$/, "");
}

export async function carbonmarkFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const apiKey = process.env.CARBONMARK_API_KEY;
  const url = `${process.env.CARBONMARK_BASE_URL}/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  
  if (!res.ok || (json && json.error)) {
    const msg = json?.error || `Carbonmark request failed (${res.status})`;
    throw new Error(msg);
  }

  return json as T;
}
