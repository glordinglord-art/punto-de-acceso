import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types/common.types';
import type { Gym, Branch } from '../types/gyms.types';

export const gymsService = {
  async getAll(): Promise<ApiResponse<Gym[]>> {
    return api.get<ApiResponse<Gym[]>>('/gyms');
  },

  async getById(id: string): Promise<ApiResponse<Gym>> {
    return api.get<ApiResponse<Gym>>(`/gyms/${id}`);
  },

  async create(data: {
    name: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
  }): Promise<ApiResponse<Gym>> {
    return api.post<ApiResponse<Gym>>('/gyms', data);
  },

  async update(
    id: string,
    data: Partial<Gym>
  ): Promise<ApiResponse<Gym>> {
    return api.put<ApiResponse<Gym>>(`/gyms/${id}`, data);
  },

  async getBranches(gymId: string): Promise<ApiResponse<Branch[]>> {
    return api.get<ApiResponse<Branch[]>>(`/gyms/${gymId}/branches`);
  },

  async createBranch(
    gymId: string,
    data: {
      name: string;
      slug?: string;
      address?: string;
      city?: string;
      phone?: string;
    }
  ): Promise<ApiResponse<Branch>> {
    return api.post<ApiResponse<Branch>>(`/gyms/${gymId}/branches`, data);
  },

  async updateBranch(
    gymId: string,
    branchId: string,
    data: Partial<Branch>
  ): Promise<ApiResponse<Branch>> {
    return api.put<ApiResponse<Branch>>(
      `/gyms/${gymId}/branches/${branchId}`,
      data
    );
  },

  async deleteBranch(
    gymId: string,
    branchId: string
  ): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/gyms/${gymId}/branches/${branchId}`);
  },
};
