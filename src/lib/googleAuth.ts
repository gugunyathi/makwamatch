import { UserRole, UserProfile } from "../types";
import { apiJson, setSessionToken } from "./api";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

interface GoogleAuthOptions {
  role: UserRole;
  company?: string;
}

interface GoogleSessionResponse {
  user: UserProfile;
  token: string;
  googleProfile?: {
    id?: string;
    name?: string;
    imageUrl?: string;
    email?: string;
  };
}

function getGoogleClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is missing. Set it in your environment variables.");
  }
  return clientId;
}

function requestGoogleAccessToken() {
  return new Promise<string>((resolve, reject) => {
    const gsi = window.google?.accounts?.oauth2;
    if (!gsi?.initTokenClient) {
      reject(new Error("Google Identity Services not loaded. Ensure https://accounts.google.com/gsi/client is available."));
      return;
    }

    const tokenClient = gsi.initTokenClient({
      client_id: getGoogleClientId(),
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || "Google authentication failed"));
          return;
        }
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export async function signInWithGoogle(options: GoogleAuthOptions) {
  const accessToken = await requestGoogleAccessToken();
  const session = await apiJson<GoogleSessionResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({
      accessToken,
      role: options.role,
      company: options.company,
    }),
  });

  setSessionToken(session.token);
  localStorage.setItem("makwa_user", JSON.stringify(session.user));

  return session;
}
