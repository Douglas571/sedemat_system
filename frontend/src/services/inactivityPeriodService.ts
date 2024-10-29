// inactivityPeriodService.ts
import create from '@ant-design/icons/lib/components/IconFont';
import axios from 'axios';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const baseUrl = `${HOST}/v1/inactivity-periods`;

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
}, token: string) {
  const response = await axios.post(baseUrl, data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status > 300) {
    const error = response.data?.error || 'An error occurred';
    throw error;
  }

  return response.data;
}

/**
 * Fetches all inactivity periods for a specific business.
 * @param businessId - The ID of the business
 */
export async function getInactivityPeriods(businessId: number, token: string) {
  const response = await axios.get(`${baseUrl}/${businessId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.map( p =>({
    ...p,
    startAt: new Date(p.startAt),
    endAt: p.endAt ? new Date(p.endAt) : null,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt)
  }));
}

/**
 * Fetches a specific inactivity period by ID.
 * @param id - The ID of the inactivity period
 */
export async function getInactivityPeriodById(id: number, token: string) {
  const response = await axios.get(`${baseUrl}/details/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return {
    ...response.data,
    startAt: new Date(response.data.startAt),
    endAt: response.data.endAt ? new Date(response.data.endAt) : null,
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt)
  }
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
}, token: string) {
  const response = await axios.put(`${baseUrl}/${id}`, updates, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  
  if (response.status > 300) {
    const error = response.data?.error || 'An error occurred';
    throw error;
  }

  return response.data;
}

/**
 * Deletes an inactivity period by ID.
 * @param id - The ID of the inactivity period
 */
export async function deleteInactivityPeriod(id: number, token: string) {
  const response = await axios.delete(`${baseUrl}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  
  if (response.status > 300) {
    const error = response.data?.error || 'An error occurred';
    throw error;
  }

  return response.data;
}