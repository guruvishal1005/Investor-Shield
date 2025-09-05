import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  token: string | null;
}

const AUTH_STORAGE_KEY = "investor_shield_auth";

export const authService = {
  getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to parse auth state:", error);
    }
    return { user: null, token: null };
  },

  setAuthState(authState: AuthState) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  },

  clearAuthState() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    const { token } = this.getAuthState();
    return !!token;
  },

  getAuthHeaders(): Record<string, string> {
    const { token } = this.getAuthState();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
