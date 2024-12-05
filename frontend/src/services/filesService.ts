// filesServiceClient.ts
import axios from 'axios';

const BASE_URL = '/api/files';

interface FileData {
  id?: number;
  path: string;
  type: string;
  description?: string;
  folder: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Uploads a file to the server.
 * @param file - The file to upload (File instance).
 * @param folder - The folder where the file will be stored.
 * @param description - Optional description for the file.
 * @param purpose - Optional purpose of the file.
 * @param token - The authentication token.
 * @returns The uploaded file metadata.
 */
export async function uploadFile(
  file: File,
  folder: string,
  description?: string,
  purpose?: string,
  token?: string
): Promise<FileData> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (description) formData.append('description', description);
  if (purpose) formData.append('purpose', purpose);

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * Fetches a file by its ID.
 * @param id - The ID of the file to fetch.
 * @param token - The authentication token.
 * @returns The file metadata.
 */
export async function getFile(id: number, token?: string): Promise<FileData> {
  const response = await axios.get(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * Updates a file's metadata.
 * @param id - The ID of the file to update.
 * @param updateData - The data to update.
 * @param token - The authentication token.
 * @returns The updated file metadata.
 */
export async function updateFile(id: number, updateData: Partial<FileData>, token?: string): Promise<FileData> {
  const response = await axios.put(`${BASE_URL}/${id}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * Deletes a file by its ID.
 * @param id - The ID of the file to delete.
 * @param token - The authentication token.
 */
export async function deleteFile(id: number, token?: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetches a list of all files.
 * @param token - The authentication token.
 * @returns An array of file metadata.
 */
export async function listFiles(token?: string): Promise<FileData[]> {
  const response = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

