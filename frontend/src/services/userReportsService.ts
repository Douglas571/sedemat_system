import axios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import downloadFile from 'js-file-download'
import dayjs from 'dayjs'


// Define the base URL for your API
const IP = import.meta.env.VITE_BACKEND_IP || "localhost";
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000";
const HOST = "http://" + IP + ":" + PORT;

const API_BASE_URL = HOST + '/v1/reports/users';

// Define the structure of a Report
interface Report {
  id: number;
  timestamp: string;
  taxCollectors: Array<{
    username: string;
    id: number;
    grossIncomeInvoicesCreated: number;
    grossIncomeInvoicesIssued: number;
    grossIncomeInvoicesUpdated: number;
  }>;
  fiscals: Array<{
    username: string;
    id: number;
    grossIncomesCreated: number;
    paymentsCreated: number;
  }>;
  settlers: Array<{
    username: string;
    id: number;
    settlementsCreated: number;
  }>;
}

// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token from localStorage
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const userAuth = localStorage.getItem('userAuth'); // Replace 'authToken' with your token key

    if (!userAuth) {
      throw new Error('Usuario no registrado')
    }

    const { token } = JSON.parse(userAuth)
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

// Function to get all reports
export async function getAllReports(data: {
  filters: {
    period: Date,
  },
  format: 'excel' | 'json'
}): Promise<Report[] | void> {
  try {
    console.log({data})
    let { format, filters } = data
    
    
    if (format === 'excel') {
      const response: AxiosResponse = await axiosInstance.get('/', {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          format,
          period: filters?.period
        },
        data: {
          filters
        }
      });
  
      const data = response.data;
  
      // Trigger the file download
      downloadFile(data, `reporte-usuarios-${dayjs().format('DD-MM-YYYY')}.xlsx`);
    } else if (format === 'json') {
      const response: AxiosResponse<Report[]> = await axiosInstance.get('/', {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          format,
          period: filters?.period
        },
        data: {
          filters
        }
      });
  
      const data = response.data;
      
      return data;
    } else {
      throw new Error('Invalid format')
    }
    
  } catch (error) {
    console.error('Error fetching all reports:', error);
    throw error;
  }
}

// Function to get a single report by ID
export async function getOneReport(reportId: number): Promise<Report> {
  try {
    const response: AxiosResponse<Report> = await axiosInstance.get(`/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report with ID ${reportId}:`, error);
    throw error;
  }
}

// Function to delete a report by ID
export async function deleteOneReport(reportId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/${reportId}`);
    console.log(`Report with ID ${reportId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting report with ID ${reportId}:`, error);
    throw error;
  }
}

// Function to create a new report
export async function createReport(): Promise<Report> {
  try {
    const response: AxiosResponse<Report> = await axiosInstance.post('/');
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

// // Example usage
// (async () => {
//   try {
//     // Get all reports
//     const allReports = await getAllReports();
//     console.log('All Reports:', allReports);

//     // Get one report by ID
//     const reportId = 1; // Replace with a valid report ID
//     const singleReport = await getOneReport(reportId);
//     console.log('Single Report:', singleReport);

//     // Create a new report
//     const newReport: Omit<Report, 'id'> = {
//       timestamp: new Date().toISOString(),
//       taxCollectors: [
//         {
//           username: 'cheo',
//           id: 9,
//           grossIncomeInvoicesCreated: 25,
//           grossIncomeInvoicesIssued: 25,
//           grossIncomeInvoicesUpdated: 0
//         }
//       ],
//       fiscals: [
//         {
//           username: 'yusfran',
//           id: 11,
//           grossIncomesCreated: 8,
//           paymentsCreated: 3
//         }
//       ],
//       settlers: [
//         {
//           username: 'liquidador',
//           id: 13,
//           settlementsCreated: 0
//         }
//       ]
//     };
//     const createdReport = await createReport(newReport);
//     console.log('Created Report:', createdReport);

//     // Delete a report by ID
//     const reportToDeleteId = 2; // Replace with a valid report ID
//     await deleteOneReport(reportToDeleteId);
//   } catch (error) {
//     console.error('Error in example usage:', error);
//   }
// })();