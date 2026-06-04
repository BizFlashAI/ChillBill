import { create } from "zustand";
import {
  auth,
  signUp,
  signIn,
  signOut,
  onAuthChange,
  type User,
} from "../services/firebase";

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: () => {
    onAuthChange((user) => {
      set({ user, initialized: true, loading: false });
    });
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await signIn(email, password);
      set({ loading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      set({ error: formatFirebaseError(message), loading: false });
    }
  },

  register: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await signUp(email, password);
      set({ loading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed";
      set({ error: formatFirebaseError(message), loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut();
      set({ loading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Logout failed";
      set({ error: formatFirebaseError(message), loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

function formatFirebaseError(message: string): string {
  if (message.includes("auth/email-already-in-use")) return "Email already in use";
  if (message.includes("auth/invalid-email")) return "Invalid email address";
  if (message.includes("auth/weak-password")) return "Password must be at least 6 characters";
  if (message.includes("auth/user-not-found")) return "No account found with this email";
  if (message.includes("auth/wrong-password")) return "Incorrect password";
  if (message.includes("auth/invalid-credential")) return "Invalid email or password";
  if (message.includes("auth/too-many-requests")) return "Too many attempts. Try again later";
  return message;
}
