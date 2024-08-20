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