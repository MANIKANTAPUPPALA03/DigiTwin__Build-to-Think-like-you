/**
 * Hook to request a Google OAuth2 access token via Google Identity Services (GIS).
 * This is SEPARATE from Firebase Auth — it uses an external GCP project's Client ID
 * to get an access token with Gmail/Calendar scopes.
 */

const CLIENT_ID = "508843395715-nq2s6kael8bqp866mmj070ghfk26iq4p.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly";

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initCodeClient: (config: {
                        client_id: string;
                        scope: string;
                        ux_mode: string;
                        callback: (response: { code?: string; error?: string; error_description?: string }) => void;
                    }) => { requestCode: () => void };
                };
            };
        };
    }
}

export function requestGoogleAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
            reject(new Error("Google Identity Services not loaded yet"));
            return;
        }

        // Use Code Client with popup UX to avoid page reload
        const client = window.google.accounts.oauth2.initCodeClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            ux_mode: 'popup',
            callback: (response) => {
                if (response.error) {
                    console.error("❌ OAuth error:", response.error, response.error_description);
                    reject(new Error(response.error_description || response.error));
                    return;
                }
                if (response.code) {
                    console.log("✅ Auth Code obtained via Popup");
                    exchangeCodeForToken(response.code).then(resolve).catch(reject);
                } else {
                    reject(new Error("No authorization code received — user may have closed the popup"));
                }
            },
        });

        client.requestCode();
    });
}

// Exchange auth code for access token via backend
// For popup mode, redirect_uri MUST be "postmessage" — this is a special Google value
async function exchangeCodeForToken(code: string): Promise<string> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirect_uri: "postmessage" }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to exchange code");
        }

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem("google_access_token", data.access_token);
            console.log("✅ Google access token saved to localStorage");
            return data.access_token;
        }
        throw new Error("No access token returned");
    } catch (error) {
        console.error("❌ Token exchange failed:", error);
        throw error;
    }
}
