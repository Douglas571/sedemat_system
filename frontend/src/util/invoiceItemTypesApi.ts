// Invoice Item Type api

const IP = process.env.BACKEND_IP || "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT


// a function to get all invoice items
export async function findAll() {
  try {
    const response = await fetch(HOST + '/v1/invoice-item-types');
    if (!response.ok) {
      throw new Error('Failed to fetch invoice item types');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoice item types:', error);
    throw error;
  }
}