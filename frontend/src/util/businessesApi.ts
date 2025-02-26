import { CertificateOfIncorporation, Business } from "./types";
import axios from "axios";

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

export async function deleteBusiness(businessId: number, token: string) {
    
    if (!token) {
        throw new Error('No token found');
    }

    const response = await fetch(`${HOST}/v1/businesses/${businessId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const {error} = await response.json();
        console.log({error})
        if (error.name === 'UserNotAuthorized') {
            throw new Error("Usuario no autorizado")
        }

        throw new Error('Failed to delete business');
    }

    return response;
}

export async function uploadCertificateOfIncorporation(coi: CertificateOfIncorporation) {
    const formData = new FormData();
    formData.append('businessId', coi.businessId.toString()); // Add other form fields as needed
    formData.append('expirationDate', coi.expirationDate); // Add the expiration date

    // Add multiple images (docImages)
    if (coi.docImages.length > 0) {
        coi.docImages.forEach((file) => {
            formData.append('docImages', file);
        });
    }

    try {
        const response = await fetch(`${HOST}/v1/businesses/coi`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload certificate of incorporation');
        }

        const data = await response.json();
        console.log('Uploaded certificate of incorporation:', data);
    } catch (error) {
        console.error('Error uploading files:', error);
    }
}


export async function isBusinessEligibleForEconomicLicense(businessId: number): Promise<any> {
    try {
      const response = await fetch(`${HOST}/v1/businesses/${businessId}/elegible-for-economic-license`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error('Failed to fetch eligibility status.');
        return false;
      }
  
      const body = await response.json();
  
      if (body.isValid) {
        return body

      } else {
        console.error(body.error?.message || 'An unknown error occurred.');
        console.log({errors: body.error})
        return body;
      }
    } catch (error) {
      console.error('Error fetching eligibility status:', error);
      console.log({error})
    }
  }

  export async function updateBusinessData({
    id, 
    business,
    token
  }:{
    id: number, 
    business: Business,
    token: string
  }) {
    const url = `${HOST}/v1/businesses/${id}`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(business)
    };

    let response = await fetch(url, requestOptions);
    let data = await response.json()

    if (!response.ok) {
        let {error} = data
        let errorToThrow = new Error(error?.message || 'Failed to post business data')

        // check if is unanutorized error
        if (error.name === 'UserNotAuthorized') {
            errorToThrow = new Error('Sólo fiscales y recaudadores pueden modificar empresas')
            error.name = 'UserNotAuthorized'
            throw errorToThrow
            
        }
        console.log({error})
        throw errorToThrow
    }

    let updatedBusiness = data
    console.log('Business data updated successfully');
    // Optionally handle response data here

    console.log(JSON.stringify(updatedBusiness, null, 2))
    
    return updatedBusiness
}

export async function createBusiness({
    business,
    token
}: {
    business: Business,
    token: string
}): Promise<Business> {
    const url = `${HOST}/v1/businesses/`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(business)
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            let {error} = await response.json()
            let errorToThrow = new Error(error?.message || 'Failed to post business data')

            // check if is unanutorized error
            if (error.name === 'UserNotAuthorized') {
                errorToThrow = new Error('Sólo fiscales y recaudadores pueden modificar empresas')
                error.name = 'UserNotAuthorized'
                throw errorToThrow
            }
            
            throw errorToThrow
        }
        console.log('Business data posted successfully');
        // Optionally handle response data here
        let data = await response.json()
        return data
    } catch (error) {
        console.error('Error posting business data:', error.message);
        // Handle error state in your application
        throw Error(error.message)
    }
}

export async function getBusinessEconomicActivityIndex(token: string) {
    const response = await axios.get(`${HOST}/v1/businesses/economic-activity-index`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data
}

export async function getAll(): Promise<Business[]> {
    try {
        const response = await fetch(`${HOST}/v1/businesses`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching business data:', error);
        throw error;
    }
}