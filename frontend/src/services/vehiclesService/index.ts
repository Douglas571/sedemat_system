import axios, { AxiosResponse, AxiosInstance, InternalAxiosRequestConfig  } from 'axios';
import dayjs from 'dayjs';

import { IVehicle, IVehicleType } from '../../util/types';

// Define the base URL for your API
const IP = import.meta.env.VITE_BACKEND_IP || 'localhost';
const PORT = import.meta.env.VITE_BACKEND_PORT || '3000';
const HOST = 'http://' + IP + ':' + PORT;

const API_BASE_URL = HOST + '/v1/vehicles';

// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token from localStorage
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig ) => {
    const userAuth = localStorage.getItem('userAuth'); // Replace 'authToken' with your token key

    if (!userAuth) {
      throw new Error('Usuario no registrado');
    }

    const { token } = JSON.parse(userAuth);
    if (token) {
      config.headers = config.headers || {}; // Ensure headers exist
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// IVehicles API Methods

/**
 * Get all vehicles
 * @returns {Promise<IVehicle[]>} - Array of vehicles
 */
export async function getAllVehicles(data: {
  filter: {
    createdAtStart: string,
    createdAtEnd: string
  }
}): Promise<IVehicle[]> {
  try {
    const response: AxiosResponse<IVehicle[]> = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    throw error;
  }
}

/**
 * Get a single vehicle by ID
 * @param {number} vehicleId - The ID of the vehicle
 * @returns {Promise<IVehicle>} - The vehicle data
 */
export async function getOneVehicle(vehicleId: number): Promise<IVehicle> {
  try {
    const response: AxiosResponse<IVehicle> = await axiosInstance.get(`/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle with ID ${vehicleId}:`, error);
    throw error;
  }
}

/**
 * Create a new vehicle
 * @param {Omit<IVehicle, 'id'>} data - The vehicle data (without ID)
 * @returns {Promise<IVehicle>} - The created vehicle
 */
export async function createVehicle(data: Omit<IVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<IVehicle> {
  try {
    const response: AxiosResponse<IVehicle> = await axiosInstance.post('/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
}

/**
 * Update a vehicle by ID
 * @param {number} vehicleId - The ID of the vehicle
 * @param {Partial<IVehicle>} updates - The fields to update
 * @returns {Promise<IVehicle>} - The updated vehicle
 */
export async function updateVehicle(vehicleId: number, updates: Partial<IVehicle>): Promise<IVehicle> {
  try {
    const response: AxiosResponse<IVehicle> = await axiosInstance.patch(`/${vehicleId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle with ID ${vehicleId}:`, error);
    throw error;
  }
}

/**
 * Delete a vehicle by ID
 * @param {number} vehicleId - The ID of the vehicle
 * @returns {Promise<void>}
 */
export async function deleteVehicle(vehicleId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/${vehicleId}`);
    console.log(`IVehicle with ID ${vehicleId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${vehicleId}:`, error);
    throw error;
  }
}

// IVehicleTypes API Methods

/**
 * Get all vehicle types
 * @returns {Promise<IVehicleType[]>} - Array of vehicle types
 */
export async function getAllVehicleTypes(): Promise<IVehicleType[]> {
  try {
    const response: AxiosResponse<IVehicleType[]> = await axiosInstance.get('/types');
    return response.data;
  } catch (error) {
    console.error('Error fetching all vehicle types:', error);
    throw error;
  }
}

/**
 * Get a single vehicle type by ID
 * @param {number} vehicleTypeId - The ID of the vehicle type
 * @returns {Promise<IVehicleType>} - The vehicle type data
 */
export async function getOneVehicleType(vehicleTypeId: number): Promise<IVehicleType> {
  try {
    const response: AxiosResponse<IVehicleType> = await axiosInstance.get(`/types/${vehicleTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle type with ID ${vehicleTypeId}:`, error);
    throw error;
  }
}

/**
 * Create a new vehicle type
 * @param {Omit<IVehicleType, 'id'>} data - The vehicle type data (without ID)
 * @returns {Promise<IVehicleType>} - The created vehicle type
 */
export async function createVehicleType(data: Omit<IVehicleType, 'id'>): Promise<IVehicleType> {
  try {
    const response: AxiosResponse<IVehicleType> = await axiosInstance.post('/types', data);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle type:', error);
    throw error;
  }
}

/**
 * Update a vehicle type by ID
 * @param {number} vehicleTypeId - The ID of the vehicle type
 * @param {Partial<IVehicleType>} updates - The fields to update
 * @returns {Promise<IVehicleType>} - The updated vehicle type
 */
export async function updateVehicleType(vehicleTypeId: number, updates: Partial<IVehicleType>): Promise<IVehicleType> {
  try {
    const response: AxiosResponse<IVehicleType> = await axiosInstance.patch(`/types/${vehicleTypeId}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle type with ID ${vehicleTypeId}:`, error);
    throw error;
  }
}

/**
 * Delete a vehicle type by ID
 * @param {number} vehicleTypeId - The ID of the vehicle type
 * @returns {Promise<void>}
 */
export async function deleteVehicleType(vehicleTypeId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/types/${vehicleTypeId}`);
    console.log(`IVehicle type with ID ${vehicleTypeId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting vehicle type with ID ${vehicleTypeId}:`, error);
    throw error;
  }
}