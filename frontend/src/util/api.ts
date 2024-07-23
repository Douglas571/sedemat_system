const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export type Business = {
    id?: number
    businessName: string
    dni: string 
    email: string 
}

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



export async function updateBusinessData(id: number, business: Business) {
    const url = `${HOST}/v1/businesses/${id}`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'PUT',
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
    } catch (error) {
        console.error('Error posting business data:', error.message);
        // Handle error state in your application
    }
}

// Economic Activities
export type EconomicActivity = {
    id: number
    code: string
    title: string
    alicuota: number
    minimiunTax: number
}

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
export type BranchOffice = {
    id?: number;
    address: string;
    phone: string;
    businessId: number; // Assuming you have a reference to the business ID
};

export async function registerBranchOffice(branchOffice: BranchOffice): Promise<BranchOffice> {
    console.log({newOfficeInApi: branchOffice})
    const url = `${HOST}/v1/branch-offices`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchOffice),
    });
    console.log("after fetch")

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to register branch office: ${errorData.error?.msg || response.statusText}`);
    }

    console.log('Branch office registered successfully');

    const data = await response.json()
    return data
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

export type License = {
    id?: number 
    branchOfficeId: number 
    economicActivityId: number
    openAt?: String 
    closeAt?: String
    issuedDate: Date 
    expirationDate: Date
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