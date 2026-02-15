/**
 * API helper — sends authenticated requests to the backend.
 * Automatically attaches Firebase ID token and Google access token.
 */

const API_BASE = "http://localhost:8000";

export async function apiFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    // Try to get Firebase auth token
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    const user = auth.currentUser;

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (user) {
        const idToken = await user.getIdToken();
        headers["Authorization"] = `Bearer ${idToken}`;
    }

    // Attach Google access token for Gmail/Calendar
    const googleToken = localStorage.getItem("google_access_token");
    if (googleToken) {
        headers["X-Google-Token"] = googleToken;
    } else {
        console.warn("⚠️ apiFetch: No google_access_token found in localStorage");
    }

    return fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });
}

export async function apiGet(path: string) {
    const res = await apiFetch(path);
    return res.json();
}

export async function apiPost(path: string, body: any) {
    const res = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return res.json();
}
