// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
  cep?: string;
  logradouro?: string;
  numeroCasa?: string;
  complemento?: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const user = await authService.login({
      email,
      password,
    });

    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    return user;
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const user = await authService.register({
      name,
      email,
      password,
    });

    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return {
    currentUser,
    setCurrentUser,
    login: handleLogin,
    register: handleRegister,
    logout,
  };
}
