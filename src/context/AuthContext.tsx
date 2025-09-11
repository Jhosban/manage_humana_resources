import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'manager';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  Name: string;
  LastName: string;
  Password: string;
  Email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = 'http://localhost:3000/auth';

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      console.log('Login response data:', data); // Para debugging
      
      // Construir objeto de usuario con la respuesta del servidor
      let userData: User;
      
      // Caso específico para la respuesta del login que contiene admin
      if (data.admin) {
        const { Name, LastName, Email, id } = data.admin;
        userData = {
          id: id?.toString() || Date.now().toString(),
          name: `${Name} ${LastName}`,
          email: Email || email,
          role: 'admin', // Asumiendo que si viene en 'admin' es un administrador
        };
      } 
      // Caso genérico para otras posibles estructuras
      else {
        userData = {
          id: data.id || data.userId || Date.now().toString(),
          name: data.name || data.userName || 'Usuario',
          email: email,
          role: data.role || 'employee',
        };
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User data saved after login:', userData); // Para debugging
      
      // Si el servidor devuelve un token o access_token, guardarlo
      if (data.token) {
        localStorage.setItem('token', data.token);
      } else if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      // Eliminar cualquier campo adicional no requerido por la API
      const apiPayload: Record<string, string> = {
        Name: userData.Name,
        LastName: userData.LastName,
        Password: userData.Password,
      };
      
      // Solo agregar Email si está presente
      if (userData.Email) {
        apiPayload.Email = userData.Email;
      }
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      const data = await response.json();
      
      // Construir objeto de usuario con la respuesta del servidor
      const newUser: User = {
        id: data.id || data.userId || Date.now().toString(),
        name: `${userData.Name} ${userData.LastName}`,
        email: userData.Email || '',
        role: 'employee',
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Si el servidor devuelve un token, guardarlo también
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
