const API_HOMA_URL = process.env.API_HOMA_URL || 'https://apihoma.homa.cl:7200';
let currentToken = process.env.HOMA_API_KEY || '';

export async function makeApiRequest(endpoint: string): Promise<any> {
  const url = `${API_HOMA_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function makePostRequest(endpoint: string, body: any): Promise<any> {
  const url = `${API_HOMA_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function setToken(token: string): void {
  currentToken = token;
}
