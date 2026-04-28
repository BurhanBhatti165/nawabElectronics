import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function RoleGate({ allow, children }) {
  const role = useAuthStore((s) => s.role);
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
