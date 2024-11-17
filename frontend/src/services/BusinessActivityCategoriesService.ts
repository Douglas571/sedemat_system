// import { axiosInstance } from '../utils/axiosInstance';
import { IBusinessActivityCategory } from '../util/types';

import axios from 'axios';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const axiosInstance = axios.create({
  baseURL: `${HOST}/v1`, // Adjust as per your API versioning
  timeout: 10000,
});

export default class BusinessActivityCategoryService {
  /**
   * Fetch all business activity categories.
   */
  static async getAll(token: string): Promise<IBusinessActivityCategory[]> {
    try {
      const response = await axiosInstance.get<IBusinessActivityCategory[]>('/business-activity-categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching business activity categories:', error);
      throw error;
    }
  }

  /**
   * Fetch a single business activity category by ID.
   * @param id - The ID of the category.
   */
  static async getById(id: number, token: string): Promise<IBusinessActivityCategory> {
    try {
      const response = await axiosInstance.get<IBusinessActivityCategory>(`/business-activity-categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching business activity category with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new business activity category.
   * @param data - The category details.
   */
  static async create(data: Omit<IBusinessActivityCategory, 'id'>, token: string = ''): Promise<IBusinessActivityCategory> {
    try {
      const response = await axiosInstance.post<IBusinessActivityCategory>('/business-activity-categories', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating business activity category:', error);
      throw error;
    }
  }

  /**
   * Update an existing business activity category.
   * @param id - The ID of the category to update.
   * @param data - The updated category details.
   */
  static async update(id: number, data: Partial<IBusinessActivityCategory>, token: string = ''): Promise<IBusinessActivityCategory> {
    try {
      const response = await axiosInstance.put<IBusinessActivityCategory>(`/business-activity-categories/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating business activity category with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a business activity category by ID.
   * @param id - The ID of the category to delete.
   */
  static async delete(id: number, token: string): Promise<void> {
    try {
      await axiosInstance.delete(`/business-activity-categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(`Error deleting business activity category with ID ${id}:`, error);
      throw error;
    }
  }
}