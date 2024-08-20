import React, { useEffect, useState } from 'react'
import { FormProps, Modal, Space } from 'antd'
import { Form, Input, Button, message, Typography, Select, Flex, Image} from 'antd'
const { Title, Paragraph } = Typography
import { useParams, Link, useNavigate } from 'react-router-dom';

import type {Business, BranchOffice, License, EconomicActivity} from '../util/api'

import * as api from '../util/api'
import { TypeIcon } from 'antd/es/message/PurePanel';


import { completeUrl, getCommunicationPreference } from './BusinessShared';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const reminderIntervalMap: { [key: number]: string } = {
    30: "Una vez al més",
    3: "Cada 3 días",
    7: "Cada 7 días",
    15: "Cada 15 días",
}

function BusinessViewDetails(): JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [business, setBusiness] = React.useState<Business>()
    const { businessId } = useParams();
    const navigate = useNavigate()

    let [shouldUpdatePreferredChanel, setShouldUpdatePreferredChanel] = React.useState<boolean>(false)

    useEffect(() => {
        // first load of data
        loadBusinessData()
    }, [])

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleDeleteBusiness = async () => {
        setIsModalOpen(false);

        try {
            business?.id && await api.deleteBusiness(business.id)
        } catch (error) {
            if (error.message.includes("Business not found")) {
                console.log("La empresa no existe o fue eliminada")
            }
        }
    
        navigate('/business')
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => console.log({business}), [business])

    async function loadBusinessData() {
        // get the business data 
        // feed the form with the business data
        if (businessId) {
            let fetchedBusiness = await api.fetchBusinessById(Number(businessId))
            let branchOffices = await api.fetchBranchOffices(Number(businessId))
            // TODO: Add case when there is not branch office
            console.log({branchOffices})
            setBusiness({...fetchedBusiness, branchOffices})       
        }
    }

    function isLicenseValid(license: License | undefined): boolean {
        if (!license) {
            return false
        }
        const currentDate = new Date();
        const expirationDate = new Date(license.expirationDate);
    
        return expirationDate >= currentDate;
    }

    function isLicenseExpired(license: License, months: number): boolean {
        const currentDate = new Date();
        const expirationDate = new Date(license.expirationDate);
        const differenceInMonths = (currentDate.getFullYear() - expirationDate.getFullYear()) * 12 + (currentDate.getMonth() - expirationDate.getMonth());
        return differenceInMonths > months;
    }

    function renderLicenseButton(office: BranchOffice): JSX.Element {
        const lastEconomicLicense = office?.EconomicLicenses?.slice(-1)[0]

        if (!lastEconomicLicense || isLicenseExpired(lastEconomicLicense, 4)) {
            return <Link to={`branch-office/${office.id}/license/new`}>Otorgar Licencia</Link>;
        } else if (isLicenseExpired(lastEconomicLicense, 0)) {
            return <Link to={`branch-office/${office.id}/license/renovate`}>Renovar Licencia</Link>;
        } else {
            return <span>Licencia vigente</span>;
        }
    }

    if (!business) {
        return (<div>Cargando</div>)
    }

    function getCommunicationPreference() {
        let communicationPreference = {
            preferredContact: '',
            preferredChannel: '',
            sendCalculosTo: ''
        };

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
    
        return communicationPreference;
    }
    
    function getPreferredChannelName(): String{
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

    return (
        <div>
            <Typography>
                <Title>
                    {business?.businessName || "Cargando..."} 
                    <Button 
                        data-test="business-edit-button"
                        onClick={() => navigate(`/business/edit/${businessId}`)}>Editar</Button> 
                    <Button 
                        data-test="business-delete-button"
                        onClick={() => business.id && showModal()}>Eliminar</Button>
                </Title>
                <Title level={2}>
                    Detalles
                </Title>
                <Paragraph>
                    RIF: {business?.dni}<br/>
                    Fecha de constitución: {business?.companyIncorporationDate?.toString()}<br/>
                    Fecha de vencimiento: {business?.companyExpirationDate?.toString()}<br/>
                    Fecha de vencimiento de la junta directiva: {business?.directorsBoardExpirationDate?.toString()}
                </Paragraph>
                <Title level={5}>
                    Actividad Económica
                </Title>
                <Paragraph>
                    Codigo: {business?.economicActivity.code}<br/>
                    Ramo: {business?.economicActivity?.title} <br/>
                    Alicuota: {business?.economicActivity?.alicuota}% <br/>
                    Mínimo Tributario: {business?.economicActivity?.alicuota} TCMMV-BCV
                </Paragraph>

                <Title level={2}>
                    Encargados
                </Title>
                <Title level={5}>
                    Preferencias de Comunicación
                </Title>
                <Paragraph>
                    {/* {JSON.stringify(business, null, 2)} */}
                    Contacto: <span data-test="communication-options-preferred-contact">{getCommunicationPreference().preferredContact}</span><br/>
                    Comunicados al: <span data-test="communication-options-preferred-channel">{`${getCommunicationPreference().preferredChannel} (${getPreferredChannelName()})`}</span><br/>
                    Enviar Cálculos al: <span data-test="communication-options-send-calculos">{getCommunicationPreference().sendCalculosTo}</span><br/>
                    Recordar: <span data-test="communication-options-reminder-interval">{business.reminderInterval && reminderIntervalMap[business.reminderInterval]}</span><br/>
                    {/* {JSON.stringify(getCommunicationPreference(), null, 2)} */}
                </Paragraph>


                <Title level={4}>
                    Propietario
                </Title>
                { business.owner ? (
                    <Flex> 
                        <Image
                            data-test="business-details-owner-pfp"
                            width={250}
                            src={completeUrl(business?.owner?.profilePictureUrl)}
                        />
                        <Paragraph>
                            Nombres y Apellidos: {business.owner.firstName + " " + business.owner.lastName}<br/>
                            Cédula: {business.owner.dni}<br/>
                            Phone: {business.owner.phone}<br/>
                            Whatsapp: {business.owner.whatsapp}<br/>
                            Correo: {business.owner.email}<br/>
                        </Paragraph>
                    </Flex>
                )
                : (
                    <Paragraph>
                        Sin datos
                    </Paragraph>
                )}

                

                { business.accountant && (
                    <>
                        <Title level={4}>
                            Contador
                        </Title>
                        <Paragraph>
                            Nombres y Apellidos: {business.accountant.firstName + " " + business.accountant.lastName}<br/>
                            Cédula: {business.accountant.dni}<br/>
                            Phone: {business.accountant.phone}<br/>
                            Whatsapp: {business.accountant.whatsapp}<br/>
                            Correo: {business.accountant.email}<br/>
                        </Paragraph>
                    </>
                )}

                
                { business.administrator && (
                    <>
                        <Title level={4}>
                            Administrador
                        </Title>
                        <Paragraph>
                            Nombres y Apellidos: {business.administrator.firstName + " " + business.administrator.lastName}<br/>
                            Cédula: {business.administrator.dni}<br/>
                            Phone: {business.administrator.phone}<br/>
                            Whatsapp: {business.administrator.whatsapp}<br/>
                            Correo: {business.administrator.email}<br/>
                        </Paragraph>
                    </>
                )}

                <Title level={2}>
                    Sedes o Establecimientos
                </Title>
                <Flex gap="large">
                {
                    business?.branchOffices.map( (office, index) => {
                        const lastEconomicLicense = office?.EconomicLicenses?.slice(-1)[0]
                        // console.log({office})
                        // console.log({lastEconomicLicense})

                        return (
                            <Flex key={office.id} vertical>
                                <Title level={4}>
                                    Sede #{index + 1} {renderLicenseButton(office)}
                                </Title>
                                <Paragraph>
                                    {/* Actividad Económica: {lastEconomicLicense?.EconomicActivity.title}<br/>
                                    Alicuota: {lastEconomicLicense?.EconomicActivity.alicuota}<br/>
                                    Mínimo tributario: {lastEconomicLicense?.EconomicActivity.minimumTax}<br/> */}
                                    Zona: {office.zone}<br/>
                                    Dirección: {office.address}<br/>
                                    Dimensiones: {office.dimensions}<br/>
                                    Tipo de terreno: {office.type}<br/>
                                    Procedencia: {office.isRented 
                                        ? (
                                            <>
                                                Alquilado (<a href='/example' target='_blank'>Ver contrato</a>)
                                            </>
                                        )
                                        : (
                                            <>
                                                Propio (<a href='/example' target='_blank'>Ver Inmueble</a>)
                                            </>
                                        )}<br/>


                                    <Title level={5}>
                                        Zonificación
                                    </Title>
                                    {
                                        office.zonations[0] 
                                        ? (
                                            <Paragraph>
                                                {office.zonations[0].docImages.map( image => {
                                                    return (
                                                    <p key={image.id}>
                                                        <a
                                                            target="_blank"
                                                            href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}</a><br/>
                                                    </p>)
                                                })}

                                            </Paragraph>
                                        )
                                        : (
                                            <Paragraph>
                                                No registrada
                                            </Paragraph>
                                        )
                                    }

                                    <Title level={5}>
                                        Licencia
                                    </Title>
                                    {
                                        lastEconomicLicense?.issuedDate
                                        ? (
                                            <>
                                                Fecha de Emisión: {String(lastEconomicLicense?.issuedDate)}<br/>
                                                Fecha de Vencimiento: {String(lastEconomicLicense?.expirationDate)}
                                            </>
                                        ):
                                        (
                                            <>
                                                Sin licencia
                                            </>
                                        )
                                        
                                    }
                                    
                                </Paragraph>
                            </Flex>
                        )
                    })
                }
                </Flex>


                <Title level={3}>
                    Calculos
                </Title>
            </Typography>


            <Modal title="Eliminar Contribuyente" 
                data-test='business-delete-modal'
                open={isModalOpen} 
                onOk={handleDeleteBusiness} 
                onCancel={handleCancel}>
                <p>¿Seguro que deseas eliminar este contribuyente?</p>
            </Modal>
        </div>
    )
}

export default BusinessViewDetails