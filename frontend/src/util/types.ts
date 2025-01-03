export interface IRole {
    id: number,
    name: string
}

export interface IUser {
    id: number,
    username: string,
    role: IRole,

    person: Person,
}

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

export interface IAlicuota {
    id: number;
    taxPercent: number;
    minTaxMMV: number;
    createdAt: Date;
    updatedAt: Date;

    economicActivityId: number;
}

export type EconomicActivity = {
    id: number
    code: string
    title: string
    minimumTax: number,

    alicuotaHistory: Array<IAlicuota>,
    currentAlicuota: IAlicuota,

    /*
    * @deprecated Should use currentAlicuota instead
    */
    alicuota: number,
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

export interface Person {
    id?: number
    firstName: string
    lastName: string
    dni: string
    phone: string
    whatsapp: string
    email: string

    profilePictureUrl?: string

    fullName?: string

    dniPictureUrl?: string
    rifPictureUrl?: string
}

export interface Zonation {
    branchOfficeId: number;
    docImages: string[]; // Assuming the API returns URLs or file names
}

export type IBusinessActivityCategory = {
    id: number;
    name: string;
    description: string;
  };

export type BranchOffice = {
    id?: number;
    nickname: string;
    address: string;
    
    businessId: number; // Assuming you have a reference to the business ID
    
    type: string;
    dimensions: number;
    isRented: boolean;
    chargeWasteCollection: boolean;

    EconomicLicenses?: Array<License>
    lastEconomicLicense?: License


    zonations?: Zonation
    leaseDocs?: Array<ExpirableDocument>
    buildingDocs?: Array<ExpirableDocument>
};

type TypeOfContacts = 'OWNER' | 'ACCOUNTANT' | 'ADMIN'

export interface Business {
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

export interface PermitDoc {
    branchOfficeId: string
    expirationDate: string
    type: 'FIRE' | 'HEALTH'
    docImages: File[]
}



export interface CertificateOfIncorporation {
    businessId: number
    expirationDate: Date
    docImages: File[]
}

export interface Bank {
    id: number,
    name: string,
    accountNumber: string,
}

export interface Payment {
    id: number
    reference: string
    amount: number
    paymentDate: Date
    image: string
    typeOfEntity?: 'Persona' | 'Comercio'
    personId?: number
    businessId?: number
    person?: Person
    business?: Business

    bankId: number,
    bank?: Bank,

    // deprecated
    account: string,

    grossIncomeInvoiceId?: number,
}

export interface IBankAccount {
    id?: number,
    accountNumber: string,
    name: string
}

export interface CurrencyExchangeRate {
    id?: number
    dolarBCVToBs: number
    eurosBCVToBs: number
    dolarBlackToBs?: number
    euroBlackToBs?: number
    createdAt: string
    updatedAt: string
}

export interface IWasteCollectionTax {
    id: number;
    amountMMV: number;
    period: string;
}

export interface INewGrossIncome {
    businessId: number;
    branchOfficeId: number;
    period: string;
    amountBs: number; // TODO: the amount declared by the business
    chargeWasteCollection: boolean;
    declarationImage: string; // TODO: this is an url, change property name

    currencyExchangeRatesId: number
    
    alicuotaId: number;
}
export interface IGrossIncome {
    id: number;
    businessId: number;
    branchOfficeId: number;
    branchOffice: BranchOffice
    period: string;
    amountBs: number;
    
    declarationImage: string;

    minTaxInBs: number;
    alicuotaMinTaxMMVBCV: number;

    currencyExchangeRate: CurrencyExchangeRate;
    currencyExchangeRatesId: number;
    
    wasteCollectionTaxMMVBCV: number;
    wasteCollectionTax?: IWasteCollectionTax;

    grossIncomeInvoiceId?: number;

    alicuotaId: number;
    alicuota: IAlicuota;

    // this fields are to calculate the gross income tax 
    chargeWasteCollection: boolean;
    
    TCMMVBCV: number
    branchOfficeDimensionsMts2: number
    branchOfficeType: string

    alicuotaTaxPercent: number,
    alicuotaMinTaxMMVBCV: number,
}

// Gross Income Invoice 
export interface IGrossIncomeInvoiceCreate {
    formPriceBs: number;
    grossIncomesIds: number[];
    removeGrossIncomesIds: number[];
    totalBs: number;
}

export interface IGrossIncomeInvoice {
    id: number;
    formPriceBs: number;
    grossIncomes: IGrossIncome[];
    // currencyExchangeRates: CurrencyExchangeRate
    // createdByUser: IUser
    // checkedByUser: IUser
    
    createdByUser: IUser;
    checkedByUser?: IUser;
    settledByUser?: IUser;

    paidAt: Date

    TCMMVBCV: number;

    createdByUserPersonFullName: string;
    checkedByUserPersonFullName: string;
}

export interface ISettlement {
    id: number;
    code: string;
    settledByUserId: number;
    grossIncomeInvoiceId: number;
    grossIncomeInvoice: IGrossIncomeInvoice
    settledAt: Date
}

export interface ISettlementCreate {
    code: string;
    settledByUserId: number;
    grossIncomeInvoiceId: number;
}

export interface IPenaltyType {
    id: number,
    name: string,
    defaultAmountMMVBCV: number
}

export interface IPenalty {
    id: number,
    penaltyType: IPenaltyType,
    penaltyTypeId: number,

    amountMMVBCV: number,
    
    description: string,
    
    createdAt: string,
    updatedAt: string,
    
    grossIncomeInvoiceId: number

    // TODO: Remove the optional
    createdByUserId?: number,
    createdByUser?: IUser,
}