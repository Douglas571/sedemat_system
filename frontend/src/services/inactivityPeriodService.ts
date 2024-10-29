// inactivityPeriodService.ts
import axios from 'axios';

const HOST = ''; // Define the HOST URL here when integrating

const baseUrl = `${HOST}/api/inactivityPeriods`;

/**
 * Creates a new inactivity period.
 * @param data - The inactivity period data
 */
export async function createInactivityPeriod(data: {
  startAt: Date;
  endAt?: Date | null;
  comment?: string;
  businessId: number;
  branchOfficeId?: number | null;
}) {
  const response = await axios.post(baseUrl, data);
  return response.data;
}

/**
 * Fetches all inactivity periods for a specific business.
 * @param businessId - The ID of the business
 */
export async function getInactivityPeriods(businessId: number) {
  const response = await axios.get(`${baseUrl}/${businessId}`);
  return response.data;
}

/**
 * Fetches a specific inactivity period by ID.
 * @param id - The ID of the inactivity period
 */
export async function getInactivityPeriodById(id: number) {
  const response = await axios.get(`${baseUrl}/details/${id}`);
  return response.data;
}

/**
 * Updates an existing inactivity period.
 * @param id - The ID of the inactivity period
 * @param updates - The updates to apply
 */
export async function updateInactivityPeriod(id: number, updates: {
  startAt?: Date;
  endAt?: Date | null;
  comment?: string;
  businessId?: number;
  branchOfficeId?: number | null;
}) {
  const response = await axios.put(`${baseUrl}/${id}`, updates);
  return response.data;
}

/**
 * Deletes an inactivity period by ID.
 * @param id - The ID of the inactivity period
 */
export async function deleteInactivityPeriod(id: number) {
  const response = await axios.delete(`${baseUrl}/${id}`);
  return response.status === 204;
}