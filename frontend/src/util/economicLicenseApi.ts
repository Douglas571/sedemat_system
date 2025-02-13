import axios from "axios";
import dayjs from "dayjs";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT


// POST /economic-licenses/request/:businessId
// function to request a new economic license
export const requestNewEconomicLicense = async (businessId: number, licenseData: any) => {
  try {
    const response = await fetch(`${HOST}/v1/economic-licenses/request/${businessId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(licenseData),
    });

    if (!response.ok) {
      throw new Error('Failed to request new economic license');
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting new economic license:', error);
    throw error;
  }
};

export async function findAll({
  filters, token
}) {
    try {
        const response = await axios.get(`${HOST}/v1/economic-licenses/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            params: filters,
        });

        return response.data.map(economicLicense => {
          return {
            ...economicLicense,
            issuedDate: dayjs(economicLicense.issuedDate, 'YYYY-MM-DD'),
            expirationDate: dayjs(economicLicense.expirationDate, 'YYYY-MM-DD'),
            openAt: dayjs(economicLicense.openAt, 'HH:mm:ss'),
            closeAt: dayjs(economicLicense.closeAt, 'HH:mm:ss'),
            
          }
        })
    } catch (error) {
        console.error('Error finding all economic licenses:', error);
        throw error;
    }
}



export const create = async (data: any, { token }) => {
  try {
    const response = await axios.post(`${HOST}/v1/economic-licenses/`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating economic license:', error);
    throw error;
  }

};

export const findById = async (id: number, {
  token
}) => {
  try {
    const response = await axios.get(`${HOST}/v1/economic-licenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error finding economic license:', error);
    throw error;
  }
};

export const update = async (id: number, data: any, { token }) => {
  try {
    const response = await axios.put(`${HOST}/v1/economic-licenses/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating economic license:', error);
    throw error;
  }
};

export const deleteById = async (id: number, { token }) => {
  try {
    const response = await axios.delete(`${HOST}/v1/economic-licenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  } catch (error) {
    console.error('Error deleting economic license:', error);
    throw error;
  }
};

