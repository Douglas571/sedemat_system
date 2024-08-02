import type { Business } from "util/api"

export interface ContactForm {
    firstName: string 
    lastName: string 
    dni: string
    phone: string
    whatsapp: string 
    email: string 

    profilePictureUrl?: string
}

export interface BusinessFormFields {
    businessName: string
    dni: string
    email: string
    branchOffices: Array<BranchOfficeFormFields>

    economicActivity: string

    owner: ContactForm
    accountant: ContactForm
    administrator: ContactForm

    preferredChannel: string
    sendCalculosTo: string
    preferredContact: string
    reminderInterval: string
}

export const typeOfFieldOptions = [
    {label: "I", value: "I"},
    {lable: "II", value: "II"},
    {label: "III", value: "III"},
]

export const typeOfBranchOffice = [
    {label: "Propio", value: "Propio"},
    {lable: "Alquilado", value: "Alquilado"}
]

export const businessPriority = [
    {label: "Especial", value: "Especial"},
    {lable: "Normal", value: "Normal"}
]

export const contactOptions = [
    {label: "Propietario", value: "Propietario"},
    {lable: "Contador", value: "Contador"},
    {label: "Administrador", value: "Administrador"},
]

export const channelOptions = [
    {label: "Teléfono", value: "Teléfono"},
    {lable: "Whatsapp", value: "Whatsapp"},
    {label: "Correo", value: "Correo"},
]

export const reminderIntervalOptions = [
    {label: "Una vez al més", value: "Una vez al més"},
    {label: "Cada 3 días", value: "Cada 3 días"},
    {label: "Cada 7 días", value: "Cada 7 días"},
    {lable: "Cada 15 días", value: "Cada 15 días"},
]

export const reminderIntervalMap: { [key: string]: number } = {
    "Una vez al més": 30,
    "Cada 3 días": 3,
    "Cada 7 días": 7,
    "Cada 15 días": 15,
}

export const reminderIntervalMapReverse: { [key: number]: string } = {
    30: "Una vez al més",
    3: "Cada 3 días",
    7: "Cada 7 días",
    15: "Cada 15 días",
}

// Map preferredChannel and sentCalculosTo to corresponding values
export const channelMapping: { [key: string]: string } = {
    'Teléfono': 'PHONE',
    'Whatsapp': 'WHATSAPP',
    'Correo': 'EMAIL',
};

// Map preferredContact to corresponding values
export const contactMapping: { [key: string]: string } = {
    'Administrador': 'ADMIN',
    'Propietario': 'OWNER',
    'Contador': 'ACCOUNTANT'
}

export function getCommunicationPreference(business: Business) {
    let communicationPreference = {
        preferredContact: '',
        preferredChannel: '',
        sendCalculosTo: ''
    };

    console.log({a: business})

    if (!business) {
        return communicationPreference
    }
    
    

    // Set preferred contact
    switch (business.preferredContact) {
        case "OWNER":
            communicationPreference.preferredContact = "Propietario";
            break;
        case "ACCOUNTANT":
            communicationPreference.preferredContact = "Contador";
            break;
        case "ADMINISTRATOR":
            communicationPreference.preferredContact = "Administrador";
            break;
        default:
            communicationPreference.preferredContact = "Desconocido";
    }

    // Set preferred channel
    switch (business.preferredChannel) {
        case "PHONE":
            if (business.preferredContact === "OWNER") {
                communicationPreference.preferredChannel = business.owner.phone;
            } else if (business.preferredContact === "ACCOUNTANT") {
                communicationPreference.preferredChannel = business.accountant.phone;
            } else if (business.preferredContact === "ADMIN") {
                communicationPreference.preferredChannel = business.administrator.phone;
            }
            break;
        case "WHATSAPP":
            console.log("NOTA: El contacto quiere whatsapp")
            if (business.preferredContact === "OWNER") {
                console.log("NOTA: El contacto ES PROPIETARIO")
                communicationPreference.preferredChannel = business.owner.whatsapp;
            } else if (business.preferredContact === "ACCOUNTANT") {
                communicationPreference.preferredChannel = business.accountant.whatsapp;
            } else if (business.preferredContact === "ADMIN") {
                communicationPreference.preferredChannel = business.administrator.whatsapp;
            }
            break;
        case "EMAIL":
            if (business.preferredContact === "OWNER") {
                communicationPreference.preferredChannel = business.owner.email;
            } else if (business.preferredContact === "ACCOUNTANT") {
                communicationPreference.preferredChannel = business.accountant.email;
            } else if (business.preferredContact === "ADMIN") {
                communicationPreference.preferredChannel = business.administrator.email;
            }
            break;
        default:
            communicationPreference.preferredChannel = "Desconocido";
    }

    // Set sendCalculosTo
    switch (business.sendCalculosTo) {
        case "PHONE":
            if (business.preferredContact === "OWNER") {
                communicationPreference.sendCalculosTo = business.owner.phone;
            } else if (business.preferredContact === "ACCOUNTANT") {
                communicationPreference.sendCalculosTo = business.accountant.phone;
            } else if (business.preferredContact === "ADMIN") {
                communicationPreference.sendCalculosTo = business.administrator.phone;
            }
            break;
        case "WHATSAPP":
            if (business.preferredContact === "OWNER") {
                communicationPreference.sendCalculosTo = business.owner.whatsapp;
            } else if (business.preferredContact === "ACCOUNTANT") {
                communicationPreference.sendCalculosTo = business.accountant.whatsapp;
            } else if (business.preferredContact === "ADMIN") {
                communicationPreference.sendCalculosTo = business.administrator.whatsapp;
            }
            break;
        case "EMAIL":
            if (business.preferredContact === "OWNER") {
                communicationPreference.sendCalculosTo = business.owner.email;
            } else if (business.preferredContact === "ACCOUNTANT") {
                communicationPreference.sendCalculosTo = business.accountant.email;
            } else if (business.preferredContact === "ADMIN") {
                communicationPreference.sendCalculosTo = business.administrator.email;
            }
            break;
        default:
            communicationPreference.sendCalculosTo = "Desconocido";
    }

    console.log({communicationPreference})
    return communicationPreference;
}

export function getPreferredChannelName(channel: string | undefined): string {
    console.log({channel})
    if (!channel) {
        return ''
    }
    const mapper:  { [key: string]: string } = {
        "WHATSAPP": "Whatsapp",
        "PHONE": "Teléfono",
        "EMAIL": "Correo"
    }

    return mapper[channel]
}

export function getPreferredContactType(business: Business): string {
    const mapper: { [key: string]: string } = {
        'ADMIN': 'Administrador',
        'OWNER': 'Propietario',
        'ACCOUNTANT': 'Contador'
    }

    if(!business?.preferredContact) {
        return ''
    }

    return mapper[business.preferredContact]
}

function tipoTerreno(mts2: number): number {
    // Return type 3 if mts2 is greater than or equal to 300
    if (mts2 >= 300) {
        return 3;
    }

    // Return type 2 if mts2 is greater than or equal to 50
    if (mts2 >= 50) {
        return 2;
    }

    // Return type 1 if mts2 is greater than or equal to 0
    if (mts2 >= 0) {
        return 1;
    }

    // Return 0 if none of the conditions are met
    return 0;
}

function romanize (num: number): string {
    if (isNaN(num))
        return '';

    let digits = String(+num).split("")
    let key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM", "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC", "","I","II","III","IV","V","VI","VII","VIII","IX"]
    let roman = ""
    let i = 3;

    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;

    return Array(+digits.join("") + 1).join("M") + roman;
}

export function handleDimensionsChange(officeIndex: number, dimensions: number, form) {

    // Calculate the new type using tipoTerreno
    const newType = tipoTerreno(dimensions);

    // Retrieve the current branch offices from the form
    const branchOffices = form.getFieldsValue(['branchOffices']).branchOffices;

    // Update the type of the specific branch office
    if (branchOffices[officeIndex]) {
        branchOffices[officeIndex].type = romanize(newType); // Convert newType to string
    }

    // Update the form with the new branch offices data
    form.setFieldsValue({ branchOffices });
}

export const ZONES = [
    { id: 1, label: "ALTA VISTA", value: "ALTA VISTA" },
    { id: 2, label: "AVENDA BELLA VISTA", value: "AVENDA BELLA VISTA" },
    { id: 3, label: "AVENIDA", value: "AVENIDA" },
    { id: 4, label: "AVENIDA BELLA VISTA", value: "AVENIDA BELLA VISTA" },
    { id: 5, label: "BARRIALITO", value: "BARRIALITO" },
    { id: 6, label: "CALLE BOLIVAR", value: "CALLE BOLIVAR" },
    { id: 7, label: "CALLE INDUSTRIA", value: "CALLE INDUSTRIA" },
    { id: 8, label: "CALLE LA PAZ", value: "CALLE LA PAZ" },
    { id: 9, label: "CALLE ZAMORA", value: "CALLE ZAMORA" },
    { id: 10, label: "CARRETERA NACIONAL MORON-CORO", value: "CARRETERA NACIONAL MORON-CORO" },
    { id: 11, label: "CENTRO", value: "CENTRO" },
    { id: 12, label: "CERRO", value: "CERRO" },
    { id: 13, label: "CIRO CALDERA", value: "CIRO CALDERA" },
    { id: 14, label: "CORO", value: "CORO" },
    { id: 15, label: "CUMAREBITO", value: "CUMAREBITO" },
    { id: 16, label: "DELICIAS", value: "DELICIAS" },
    { id: 17, label: "INAVI", value: "INAVI" },
    { id: 18, label: "LA CAÑADA", value: "LA CAÑADA" },
    { id: 19, label: "LAS DELICIAS", value: "LAS DELICIAS" },
    { id: 20, label: "PUENTE PIEDRA", value: "PUENTE PIEDRA" },
    { id: 21, label: "QUEBRADA DE HUTTEN", value: "QUEBRADA DE HUTTEN" },
    { id: 22, label: "SANTA ELENA", value: "SANTA ELENA" },
    { id: 23, label: "SANTA TERESA", value: "SANTA TERESA" },
    { id: 24, label: "SECTOR LAS DELICIAS", value: "SECTOR LAS DELICIAS" },
    { id: 25, label: "TRANSEUNTE", value: "TRANSEUNTE" },
    { id: 26, label: "URBANIZACION CIRO CALDERA", value: "URBANIZACION CIRO CALDERA" }
];

// TODO: Centralize this function later
export async function updateBusinessWithDateFromForm(values, { economicActivities }): Promise<Error | void>{
    // update the contacts

    // update the branch offices

    // update the business
    // get the economic activity id
    const economicActivityObject = economicActivities.find(e => e.title === values?.economicActivity);
    const economicActivityId = economicActivityObject?.id;
}