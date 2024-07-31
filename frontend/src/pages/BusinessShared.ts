import type { Business } from "util/api"

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


export function getCommunicationPreference(business: Business) {
    let communicationPreference = {
        preferredContact: '',
        preferredChannel: '',
        sendCalculosTo: ''
    };

    if (!business) {
        return communicationPreference
    }
    
    console.log({business})

    // Set preferred contact
    switch (business.preferredContact) {
        case "OWNER":
            communicationPreference.preferredContact = "Propietario";
            break;
        case "ACCOUNTANT":
            communicationPreference.preferredContact = "Contador";
            break;
        case "ADMIN":
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

export function getPreferredChannelName(): String{
    const mapper:  { [key: string]: string } = {
        "WHATSAPP": "Whatsapp",
        "PHONE": "Teléfono",
        "EMAIL": "Correo"
    }

    if (!business?.preferredChannel) {
        return ''
    }
    return mapper[business?.preferredChannel]
}