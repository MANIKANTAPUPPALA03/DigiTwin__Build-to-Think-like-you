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
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: { access_token?: string; error?: string }) => void;
                    }) => { requestAccessToken: () => void };
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

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
                if (response.error) {
                    console.error("❌ GIS token error:", response.error);
                    reject(new Error(response.error));
                    return;
                }
                if (response.access_token) {
                    console.log("✅ GIS access token obtained (length:", response.access_token.length, ")");
                    localStorage.setItem("google_access_token", response.access_token);
                    resolve(response.access_token);
                } else {
                    reject(new Error("No access token in GIS response"));
                }
            },
        });

        client.requestAccessToken();
    });
}
