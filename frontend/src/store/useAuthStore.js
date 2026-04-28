import { create } from "zustand";
import { persist } from "zustand/middleware";

const ALLOWED_ROLES = ["customer", "manager", "admin"];

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      role: "customer",
      isAuthenticated: false,
      
      login: (userData) => {
        set({ 
          user: userData, 
          role: userData.role || "customer",
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          role: "customer", 
          isAuthenticated: false 
        });
      },
      
      setRole: (role) => {
        if (!ALLOWED_ROLES.includes(role)) return;
        set({ role });
      },
    }),
    { name: "auth-role-storage" }
  )
);
