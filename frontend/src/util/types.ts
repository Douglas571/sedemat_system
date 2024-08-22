export interface DocumentPayload {
    branchOfficeId: number;
    expirationDate: Date;
    docImages: File[];
}

export interface DocImages {
    id: number
    url: string
    pageNumber: number

}

export interface ExpirableDocument {
    id: number
    branchOfficeId: number
    expirationDate: Date
    docImages: Array<DocImages>
}

export type EconomicActivity = {
    id: number
    code: string
    title: string
    alicuota: number
    minimiunTax: number
}

export type License = {
    id?: number 
    branchOfficeId: number 
    economicActivityId: number
    openAt?: String 
    closeAt?: String
    issuedDate: Date 
    expirationDate: Date

    EconomicActivity: EconomicActivity
}

export type Person = {
    id?: number
    firstName: string 
    lastName: string 
    dni: string
    phone: string
    whatsapp: string 
    email: string 

    profilePictureUrl?: string

    fullName?: string
}

export interface Zonation {
    branchOfficeId: number;
    docImages: string[]; // Assuming the API returns URLs or file names
}

export type BranchOffice = {
    id?: number;
    address: string;
    phone: string;
    businessId: number; // Assuming you have a reference to the business ID

    EconomicLicenses?: Array<License>
    lastEconomicLicense?: License


    zonations: Zonation
    leaseDocs?: Array<ExpirableDocument> 
    buildingDocs?: Array<ExpirableDocument>
};

type TypeOfContacts = 'OWNER' | 'ACCOUNTANT' | 'ADMIN'

export type Business = {
    id?: number
    businessName: string
    dni: string 
    branchOffices: Array<BranchOffice>
    economicActivity: EconomicActivity

    economicActivityId: number

    companyExpirationDate: Date
    companyIncorporationDate: Date
    directorsBoardExpirationDate: Date

    preferredChannel?: string
    sendCalculosTo?: string
    preferredContact?: TypeOfContacts
    reminderInterval?: number

    ownerPersonId: number 
    administratorPersonId?: number 
    accountantPersonId?: number 

    owner: Person
    accountant?: Person 
    administrator?: Person
}