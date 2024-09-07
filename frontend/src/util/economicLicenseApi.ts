const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
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

export async function findAll() {
    try {
        const response = await fetch(`${HOST}/v1/economic-licenses/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return await response.json()
    } catch (error) {
        console.error('Error finding all economic licenses:', error);
    }
}



// POST /economic-licenses/
// GET /economic-licenses/
// GET /economic-licenses/:id
// PUT /economic-licenses/:id
// DELETE /economic-licenses/:id