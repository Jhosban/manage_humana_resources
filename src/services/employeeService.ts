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
    const queryParams = new URLSearchParams();
    
    // El problema es que necesitamos invertir el número de página para obtener el orden correcto
    // Si la paginación está habilitada y hay un total de páginas
    if (params?.page !== undefined && params?.limit !== undefined) {
      // Primero realizamos una solicitud para obtener el total de páginas
      const countQueryParams = new URLSearchParams();
      if (params?.includeInactive !== undefined) countQueryParams.append('includeInactive', params.includeInactive.toString());
      countQueryParams.append('limit', params.limit.toString());
      
      const countUrl = `${BASE_URL}?${countQueryParams.toString()}`;
      try {
        // Realizamos una solicitud rápida solo para obtener el total de páginas
        const countResponse = await fetch(countUrl);
        const countData = await countResponse.json();
        const totalPages = countData.pagination.totalPages;
        
        // Calculamos la página inversa
        const invertedPage = totalPages - params.page + 1;
        
        // Usamos la página invertida para la solicitud real
        queryParams.append('page', invertedPage.toString());
      } catch (error) {
        console.error("Error obteniendo el total de páginas:", error);
        // Si hay un error, usamos la página original
        queryParams.append('page', params.page.toString());
      }
    } else if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeInactive !== undefined) queryParams.append('includeInactive', params.includeInactive.toString());
    
    const url = `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Invertimos el orden de los elementos en la página actual
    // para mostrar correctamente el orden de IDs (de menor a mayor)
    data.data = data.data.reverse();
    
    return data;
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
    const queryParams = new URLSearchParams();
    
    if (searchParams.q) queryParams.append('q', searchParams.q);
    
    // El problema es que necesitamos invertir el número de página para obtener el orden correcto
    // Si la paginación está habilitada y hay un total de páginas
    if (searchParams.page !== undefined && searchParams.limit !== undefined && searchParams.q) {
      // Primero realizamos una solicitud para obtener el total de páginas
      const countQueryParams = new URLSearchParams();
      countQueryParams.append('q', searchParams.q);
      if (searchParams?.includeInactive !== undefined) countQueryParams.append('includeInactive', searchParams.includeInactive.toString());
      countQueryParams.append('limit', searchParams.limit.toString());
      
      const countUrl = `${BASE_URL}/search?${countQueryParams.toString()}`;
      try {
        // Realizamos una solicitud rápida solo para obtener el total de páginas
        const countResponse = await fetch(countUrl);
        const countData = await countResponse.json();
        const totalPages = countData.pagination.totalPages;
        
        // Calculamos la página inversa
        const invertedPage = totalPages - searchParams.page + 1;
        
        // Usamos la página invertida para la solicitud real
        queryParams.append('page', invertedPage.toString());
      } catch (error) {
        console.error("Error obteniendo el total de páginas:", error);
        // Si hay un error, usamos la página original
        queryParams.append('page', searchParams.page.toString());
      }
    } else if (searchParams.page) {
      queryParams.append('page', searchParams.page.toString());
    }
    
    if (searchParams.limit) queryParams.append('limit', searchParams.limit.toString());
    if (searchParams.includeInactive !== undefined) queryParams.append('includeInactive', searchParams.includeInactive.toString());
    
    const url = `${BASE_URL}/search?${queryParams.toString()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Invertimos el orden de los elementos en la página actual
    // para mostrar correctamente el orden de IDs (de menor a mayor)
    data.data = data.data.reverse();
    
    return data;
  },

  // Get employee by national ID
  async getEmployeeByNationalId(nationalId: string): Promise<SingleResponse<Employee>> {
    const response = await fetch(`${BASE_URL}/national-id/${nationalId}`);
    return await response.json();
  },
};