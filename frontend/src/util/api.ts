import { 
    ExpirableDocument, 
    EconomicActivity, 
    License, 
    BranchOffice, 
    Business, 
    Person 
} from "./types"

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

console.log({HOST, PORT, IP})

/**
 * @deprecated use the branch office function instead
 */
export async function fetchBranchOffices(businessId: number): Promise<BranchOffice[]> {
    const response = await fetch(`${HOST}/v1/branch-offices?businessid=${businessId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to fetch branch offices: ${errorData.error?.msg || response.statusText}`)
    }

    const branchOffices = await response.json()
    return branchOffices
}

// Business

// TODO: Fiend all references to this method and replace them with fetchBusinesses
export async function fetchBusiness() {
    try {
        const response = await fetch(`${HOST}/v1/businesses`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log({data})
        return data;
    } catch (error) {
        console.error('Error fetching business data:', error);
        throw error;
    }
}

export async function fetchBusinessById(businessId: number): Promise<Business> {
    const url = `${HOST}/v1/businesses/${businessId}`

    try {
        const response = await fetch(url)
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Business with ID ${businessId} does not exist`)
            } else {
                throw new Error(`Failed to fetch business data: ${response.statusText}`)
            }
        }

        const business: Business = await response.json()
        return business
    } catch (error) {
        console.error('Error fetching business data:', error)
        throw error
    }
}

/**
 * @deprecated since version 1.0.0
*/
export async function sendBusinessData(business: Business): Promise<Business> {
    const url = `${HOST}/v1/businesses/`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.msg || 'Failed to post business data');
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

/**
 * @deprecated since version 1.0.0
*/
export async function updateBusinessData(id: number, business: Business) {
    const url = `${HOST}/v1/businesses/${id}`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
    };

    try {
        let response = await fetch(url, requestOptions);
        let data = await response.json()
        if (!response.ok) {
            const error = data.error;
            console.log({error})
            throw new Error(error?.message || 'Failed to post business data');
        }

        let updatedBusiness = data
        console.log('Business data updated successfully');
        // Optionally handle response data here

        console.log(JSON.stringify(updatedBusiness, null, 2))
        
        return updatedBusiness
    } catch (error) {
        console.error('Error posting business data:', error.message);
        // Handle error state in your application

        throw error
    }
}

/**
 * @deprecated since version 1.0.0
*/
export async function deleteBusiness(id: number): Promise<void> {
    const url = `${HOST}/v1/businesses/${id}`;  // Replace HOST with your actual host URL

    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete business: ${response.statusText}`);
        }

        console.log(`Business with ID ${id} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting business:', error);
        throw error;
    }
}


// Economic Activities
export async function getEconomicActivities(): Promise<Array<EconomicActivity>>{
    let economicActivities = [];

    try {
        const response = await fetch(`${HOST}/v1/economic-activities`);
        const data = await response.json();

        if (response.status !== 200) {
            throw new Error(data.error || 'Failed to fetch economic activities');
        }

        economicActivities = data

        return economicActivities;
    } catch (error) {
        
        console.log({error})
        console.error('Error fetching economic activities:', error);
        throw error;
    }
}

// Branch Offices (Comercial Establishments)
export async function registerBranchOffice(branchOffice: BranchOffice, token: string): Promise<BranchOffice> {

    try {
        console.log({newOfficeInApi: branchOffice})
        const url = `${HOST}/v1/branch-offices`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(branchOffice),
        });
        console.log("after fetch")

        if (!response.ok) {
            const data = await response.json();
            throw data.error
        }

        console.log('Branch office registered successfully');

        const data = await response.json()
        return data
    } catch(error) {
        if (error.statusCode === 401) {
            throw new Error("Usuario no autorizado")
        }

        throw new Error("Error del servidor")
    }
}

export async function getBranchOfficeById(id: number): Promise<BranchOffice | undefined> {
    let branchOffice: BranchOffice | undefined = undefined;

    try {
        const response = await fetch(`${HOST}/v1/branch-offices/${id}`);
        const data = await response.json();

        if (response.status !== 200) {
            throw new Error(data.error || 'Failed to fetch branch office');
        }

        branchOffice = data;
    } catch (error) {
        console.error('Error fetching branch office:', error);
        throw error;
    }

    return branchOffice;
}

export async function updateBranchOffice(id: number, branchOffice: BranchOffice, token: string): Promise<BranchOffice> {

    try {
        const response = await fetch(`${HOST}/v1/branch-offices/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(branchOffice),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData.error;
        }

        const updatedBranchOffice = await response.json();
        return updatedBranchOffice;
    } catch(error) {
        if (error.statusCode === 401) {
            throw new Error("Usuario no autorizado")
        }

        if (error.statusCode === 404) {
            throw new Error("Sucursal no encontrada")
        }

        throw new Error("Error del servidor")
    }
}

export async function deleteBranchOffice(id: number, token: string): Promise<void> {
    try {
        const response = await fetch(`${HOST}/v1/branch-offices/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            let data = await response.json();   
            throw data.error
        }
    } catch(error) {
        if (error.statusCode === 401) {
            throw new Error("Usuario no autorizado")
        }

        throw new Error("Error del servidor")
    }
}

// Economic Licenses
export async function registerLicense(license: License): Promise<License> {
    const response = await fetch(`${HOST}/v1/economic-licenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(license)
    });

    if (response.status !== 201) {
        console.log(response.status)
        const data = await response.json();
        console.log({data})
        throw new Error(data.error);
    }

    const newLicense: License = await response.json();
    return newLicense;
}

// Contacts

export async function registerPerson(person: Person): Promise<Person> {
    const response = await fetch(`${HOST}/v1/people`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(person),
    });

    const data = await response.json();
    console.log({data})

    if (response.status !== 201) {
        throw new Error(data.error || 'Failed to register person', { value: data.value });
    }

    return data;
}

export async function updatePerson(id: number, contactData: any): Promise<any> {
    try {
        const response = await fetch(`${HOST}/v1/people/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData),
        });

        if (!response.ok) {
            throw new Error('Failed to update person');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating person:', error);
        throw error;
    }
}

export async function getPersonById(id: number): Promise<Person> {
    const response = await fetch(`${HOST}/v1/people/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (response.status !== 200) {
        throw new Error(data.error || 'Failed to fetch person');
    }

    return data;
}

export async function getPeople(): Promise<Person[]> {

    let people: Person[] 
    try {
        const response = await fetch(`${HOST}/v1/people`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        });
    
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    
        const data = await response.json();
        people = data

        people = people.map( p => (
            {
                ...p,
                fullName: p.firstName + ' ' + p.lastName
            }
        ))

        return people;
    } catch (error) {
        console.error('Failed to fetch people:', error);
    }

    return []
}

export async function deletePerson(id: number): Promise<boolean> {
    const response = await fetch(`${HOST}/v1/people/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete person');
    }

    return true;
}


// UTIL

export function completeUrl(url: string): string {
    return HOST + url
}