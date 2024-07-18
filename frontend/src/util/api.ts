const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type BranchOffice = {
    id?: number;
    address: string;
    phone: string;
    businessId: number; // Assuming you have a reference to the business ID
};

export async function registerBranchOffice(branchOffice: BranchOffice): Promise<BranchOffice> {
    console.log({newOfficeInApi: branchOffice})
    const url = `${HOST}/v1/branchOffices`
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

