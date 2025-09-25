import type { Employee, EmployeeSearchParams, PaginatedResponse, SingleResponse, ApiResponse } from './types';

const BASE_URL = 'http://localhost:3000/employees';

export const employeeService = {
  // Create an employee
  async createEmployee(employee: Employee): Promise<SingleResponse<Employee>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    
    return await response.json();
  },

  // Get all employees with optional pagination and filtering
  async getEmployees(params?: EmployeeSearchParams): Promise<PaginatedResponse<Employee>> {
    // Crear una función de utilidad para obtener todos los empleados sin paginación
    // y luego aplicar paginación manualmente para garantizar el orden correcto
    const getAllEmployees = async (includeInactive?: boolean): Promise<Employee[]> => {
      const allQueryParams = new URLSearchParams();
      if (includeInactive !== undefined) allQueryParams.append('includeInactive', includeInactive.toString());
      
      // Solicitamos todos los empleados sin paginación
      const allUrl = `${BASE_URL}?${allQueryParams.toString()}&limit=10000`;
      const allResponse = await fetch(allUrl);
      const allData = await allResponse.json();
      
      return allData.data;
    };
    
    try {
      // Obtener todos los empleados
      const allEmployees = await getAllEmployees(params?.includeInactive);
      
      // Ordenar por ID (ascendente)
      const sortedEmployees = [...allEmployees].sort((a, b) => {
        return (a.businessEntityID || 0) - (b.businessEntityID || 0);
      });
      
      // Aplicar paginación manualmente
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Extraer la página actual
      const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);
      
      // Construir respuesta paginada
      return {
        message: "Employees retrieved successfully",
        statusCode: 200,
        data: paginatedEmployees,
        pagination: {
          total: sortedEmployees.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(sortedEmployees.length / limit)
        }
      };
      
    } catch (error) {
      console.error("Error retrieving employees:", error);
      throw error;
    }
  },

  // Get a single employee by ID
  async getEmployeeById(id: number): Promise<SingleResponse<Employee>> {
    const response = await fetch(`${BASE_URL}/${id}`);
    return await response.json();
  },

  // Update an employee
  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<SingleResponse<Employee>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
    
    return await response.json();
  },

  // Delete (deactivate) an employee
  async deleteEmployee(id: number): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    return await response.json();
  },

  // Reactivate an employee
  async reactivateEmployee(id: number): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/${id}/reactivate`, {
      method: 'PATCH',
    });
    
    return await response.json();
  },

  // Search for employees
  async searchEmployees(searchParams: EmployeeSearchParams): Promise<PaginatedResponse<Employee>> {
    try {
      // Construir los parámetros de búsqueda
      const searchQueryParams = new URLSearchParams();
      if (searchParams.q) searchQueryParams.append('q', searchParams.q);
      if (searchParams.includeInactive !== undefined) searchQueryParams.append('includeInactive', searchParams.includeInactive.toString());
      
      // Realizar la búsqueda sin paginación para obtener todos los resultados
      const searchUrl = `${BASE_URL}/search?${searchQueryParams.toString()}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      // Obtener todos los resultados de la búsqueda
      const allSearchResults = searchData.data || [];
      
      // Ordenar por ID (ascendente)
      const sortedResults = [...allSearchResults].sort((a, b) => {
        return (a.businessEntityID || 0) - (b.businessEntityID || 0);
      });
      
      // Aplicar paginación manualmente
      const page = searchParams.page || 1;
      const limit = searchParams.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Extraer la página actual
      const paginatedResults = sortedResults.slice(startIndex, endIndex);
      
      // Construir respuesta paginada
      return {
        message: "Search results retrieved successfully",
        statusCode: 200,
        data: paginatedResults,
        pagination: {
          total: sortedResults.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(sortedResults.length / limit)
        }
      };
    } catch (error) {
      console.error("Error searching employees:", error);
      throw error;
    }
  },

  // Get employee by national ID
  async getEmployeeByNationalId(nationalId: string): Promise<SingleResponse<Employee>> {
    const response = await fetch(`${BASE_URL}/national-id/${nationalId}`);
    return await response.json();
  },
};