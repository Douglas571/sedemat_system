import React, { useEffect, useState } from 'react'
import { Divider, FormProps, Modal, Space } from 'antd'
import { Form, Input, Button, message, Typography, Select, Flex, Image } from 'antd'
const { Title, Paragraph } = Typography
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';

import type { Business, BranchOffice, License, EconomicActivity } from '../util/api'

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

    useEffect(() => console.log({ business }), [business])

    async function loadBusinessData() {
        // get the business data 
        // feed the form with the business data
        if (businessId) {
            let fetchedBusiness = await api.fetchBusinessById(Number(businessId))
            let branchOffices = await api.fetchBranchOffices(Number(businessId))
            // TODO: Add case when there is not branch office
            console.log({ branchOffices })
            setBusiness({ ...fetchedBusiness, branchOffices })
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
                    communicationPreference.preferredChannel = business?.accountant?.phone;
                } else if (business.preferredContact === "ADMIN") {
                    communicationPreference.preferredChannel = business?.administrator?.phone;
                }
                break;
            case "WHATSAPP":
                // console.log("NOTA: El contacto quiere whatsapp")
                if (business.preferredContact === "OWNER") {
                    // console.log("NOTA: El contacto ES PROPIETARIO")
                    communicationPreference.preferredChannel = business.owner.whatsapp;
                } else if (business.preferredContact === "ACCOUNTANT") {
                    communicationPreference.preferredChannel = business?.accountant?.whatsapp;
                } else if (business.preferredContact === "ADMIN") {
                    communicationPreference.preferredChannel = business?.administrator?.whatsapp;
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
                if (business.preferredContact === "OWNER" && business.owner) {
                    communicationPreference.sendCalculosTo = business.owner.phone;
                } else if (business.preferredContact === "ACCOUNTANT") {
                    communicationPreference.sendCalculosTo = business?.accountant?.phone;
                } else if (business.preferredContact === "ADMIN") {
                    communicationPreference.sendCalculosTo = business?.administrator?.phone;
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

    function getPreferredChannelName(): String {
        const mapper: { [key: string]: string } = {
            "WHATSAPP": "Whatsapp",
            "PHONE": "Teléfono",
            "EMAIL": "Correo"
        }

        if (!business?.preferredChannel) {
            return ''
        }
        return mapper[business?.preferredChannel]
    }


    async function handleNewBranchOffice() {
        // travel to /businesses/:businessId/branch-offices/new
        navigate(`/businesses/${businessId}/branch-offices/new`)
    }

    async function handleDeleteBranchOffice(id: number) {
        try {
            console.log(`Deleting branch office #${id}`)
            await api.deleteBranchOffice(id)

            loadBusinessData()
        } catch (error) {
            console.log({ error })
        }

    }

    async function handleEditBranchOffice(id: number) {
        // travel to /businesses/:businessId/branch-offices/:branchOfficeId/edit
        navigate(`/businesses/${businessId}/branch-offices/${id}/edit`)
    }

    return (
        <div>
            <Typography>
                <Flex gap={'middle'} align='center'>
                    <Title>
                        {business?.businessName || "Cargando..."}    
                    </Title>
                    <Button
                        data-test="business-edit-button"
                        onClick={() => navigate(`/business/edit/${businessId}`)}>Editar
                    </Button>
                    <Button
                        data-test="business-delete-button"
                        onClick={() => business.id && showModal()}>Eliminar
                    </Button>
                </Flex>

                <Title level={2}>
                    Detalles
                </Title>
                <Paragraph>
                    RIF: {business?.dni}<br />
                    Fecha de constitución: {business?.companyIncorporationDate?.toString()}<br />
                    Fecha de vencimiento: {business?.companyExpirationDate?.toString()}<br />
                    Fecha de vencimiento de la junta directiva: {business?.directorsBoardExpirationDate?.toString()}
                </Paragraph>
                <Title level={5}>
                    Actividad Económica
                </Title>
                <Paragraph>
                    Codigo: {business?.economicActivity.code}<br />
                    Ramo: {business?.economicActivity?.title} <br />
                    Alicuota: {business?.economicActivity?.alicuota}% <br />
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
                    Contacto: <span data-test="communication-options-preferred-contact">{getCommunicationPreference().preferredContact}</span><br />
                    Comunicados al: <span data-test="communication-options-preferred-channel">{`${getCommunicationPreference().preferredChannel} (${getPreferredChannelName()})`}</span><br />
                    Enviar Cálculos al: <span data-test="communication-options-send-calculos">{getCommunicationPreference().sendCalculosTo}</span><br />
                    Recordar: <span data-test="communication-options-reminder-interval">{business.reminderInterval && reminderIntervalMap[business.reminderInterval]}</span><br />
                    {/* {JSON.stringify(getCommunicationPreference(), null, 2)} */}
                </Paragraph>


                <ContactDisplay
                    contact={business.owner}
                    role={"Propietario"}
                />

                {business.accountant && (
                    <ContactDisplay
                        contact={business.accountant}
                        role={"Contador"}
                    />
                )}

                {business.administrator && (
                    <ContactDisplay
                        contact={business.administrator}
                        role={"Administrador"}
                    />
                )}

                <Divider />
                <Typography.Title>
                    Registro de Comercio
                </Typography.Title>
                {
                    business.certificateOfIncorporations?.length > 0
                        ? (
                            <Paragraph>
                                {business.certificateOfIncorporations[business.certificateOfIncorporations.length - 1].docImages?.map(image => {
                                    return (
                                        <div key={image.id}>
                                            <a
                                                target="_blank"
                                                href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}</a><br />
                                        </div>)
                                })}

                            </Paragraph>
                        )
                        : (
                            <Paragraph>
                                No registrado
                            </Paragraph>
                        )
                }

                <BranchOfficesDisplay
                    branchOffices={business?.branchOffices}
                    onNew={handleNewBranchOffice}
                    onDelete={handleDeleteBranchOffice}
                    onEdit={handleEditBranchOffice}
                    
                />
                {/* <Title level={3}>
                    Calculos
                </Title> */}
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

function BranchOfficesDisplay({branchOffices, onEdit, onDelete, onNew}): JSX.Element {
    console.log({branchOfficesInRender: branchOffices})

    const [isDeleteOfficeModalOpen, setIsDeleteOfficeModal] = useState(false)
    const [officeToDeleteId, setOfficeToDeleteId] = useState('')

    
    // a function to delete office
    // it receive a office id 
    
    /*
        use click delete button and call a function handleOpenDeleteModal that receive
            set officeToDeleteId
            then open the modal
        
        when user select ok in delete modal
            it will call onDelete(officeToDeleteId)
            and set isDeleteOfficeModal to false        
    
    */

    function handleOpenDeleteModal(id: string) {
        setOfficeToDeleteId(id)
        setIsDeleteOfficeModal(true)
    }

    function handleDeleteOffice() {
        if (officeToDeleteId) {
            onDelete(officeToDeleteId)
            setIsDeleteOfficeModal(false)
        }
    }

    function handleCancelDeletion() {
        setOfficeToDeleteId('')
        setIsDeleteOfficeModal(false)
    }

    return (
        <>
            <Flex gap="large" align='center'>
                <Title level={2}>
                    Sedes o Establecimientos
                </Title>
                <Button onClick={() => onNew()}>
                    Nuevo
                </Button>
            </Flex>
            <Flex vertical gap="large">
            {
                branchOffices.map((office, index) => {
                    const lastEconomicLicense = office?.EconomicLicenses?.slice(-1)[0]
                    // console.log({office})
                    // console.log({lastEconomicLicense})

                    // get the last fire fighter permit
                    let firefighterPermit
                    if (office.fireFighterDocs?.length > 0) {
                        const l = office.fireFighterDocs.length
                        firefighterPermit = office.fireFighterDocs[l - 1]
                    }

                    // get the last fire fighter permit
                    let healthPermit
                    if (office.healthPermitDocs?.length > 0) {
                        const l = office.healthPermitDocs.length
                        healthPermit = office.healthPermitDocs[l - 1]
                    }

                    return (
                        <Flex key={office.id} vertical>

                            <Flex gap={"small"} align='center'>
                                <Title level={4}>
                                    Sede #{index + 1}

                                </Title>
                                <Button onClick={() => onEdit(office.id)}>Editar</Button>
                                <Button onClick={() => handleOpenDeleteModal(office.id)}>Eliminar</Button>
                            </Flex>


                            <Paragraph>
                                {/* Actividad Económica: {lastEconomicLicense?.EconomicActivity.title}<br/>
                            Alicuota: {lastEconomicLicense?.EconomicActivity.alicuota}<br/>
                            Mínimo tributario: {lastEconomicLicense?.EconomicActivity.minimumTax}<br/> */}
                                Zona: {office.zone}<br />
                                Dirección: {office.address}<br />
                                Dimensiones: {office.dimensions} m2<br />
                                Tipo de terreno: {office.type}<br />
                                Procedencia: {office.isRented
                                    ? (
                                        <>
                                            Alquilado
                                        </>
                                    )
                                    : (
                                        <>
                                            Propio
                                        </>
                                    )}<br />


                                <Title level={5}>
                                    Zonificación
                                </Title>
                                {
                                    (office.zonations.length > 0 && office.zonations[office.zonations.length - 1])
                                        ? (
                                            <Paragraph>
                                                {office.zonations[office.zonations.length - 1].docImages.map(image => {
                                                    return (
                                                        <div key={image.id}>
                                                            <a
                                                                target="_blank"
                                                                href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}</a><br />
                                                        </div>)
                                                })}

                                            </Paragraph>
                                        )
                                        : (
                                            <Paragraph>
                                                No registrada
                                            </Paragraph>
                                        )
                                }

                                {office.isRented
                                    ? (
                                        <>
                                            <Title level={5}>
                                                Contrato de Arrendamiento
                                            </Title>
                                            <Paragraph>
                                                {
                                                    office?.leaseDocs[office?.leaseDocs?.length - 1]
                                                        ? (
                                                            <>
                                                                Expira: {new Date(office.leaseDocs[office?.leaseDocs?.length - 1]?.expirationDate).toLocaleDateString()}
                                                                {
                                                                    office.leaseDocs[office?.leaseDocs?.length - 1]?.docImages.map(image => {
                                                                        return (
                                                                            <div key={image.id}>
                                                                                <a

                                                                                    target="_blank"
                                                                                    href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}
                                                                                </a>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </>
                                                        )
                                                        : (
                                                            <>No registrado</>
                                                        )
                                                }
                                            </Paragraph>
                                        </>
                                    )
                                    : (
                                        <>
                                            <Title level={5}>
                                                Contrato de propiedad
                                            </Title>
                                            <Paragraph>
                                                {
                                                    office?.buildingDocs[office?.buildingDocs?.length - 1]
                                                        ? (
                                                            <>
                                                                Expira: {new Date(office.buildingDocs[office?.buildingDocs?.length - 1]?.expirationDate).toLocaleDateString()}
                                                                {
                                                                    office.buildingDocs[office?.buildingDocs?.length - 1]?.docImages.map(image => {
                                                                        return (
                                                                            <div key={image.id}>
                                                                                <a

                                                                                    target="_blank"
                                                                                    href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}
                                                                                </a>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </>
                                                        )
                                                        : (
                                                            <>No registrado</>
                                                        )
                                                }
                                            </Paragraph>
                                        </>
                                    )

                                }

                                <Title level={5}>
                                    Licencia
                                </Title>
                                {
                                    lastEconomicLicense?.issuedDate
                                        ? (
                                            <>
                                                Fecha de Emisión: {String(lastEconomicLicense?.issuedDate)}<br />
                                                Fecha de Vencimiento: {String(lastEconomicLicense?.expirationDate)}
                                            </>
                                        ) :
                                        (
                                            <>
                                                Sin licencia
                                            </>
                                        )

                                }


                                <Permits
                                    firefighterPermit={firefighterPermit}
                                    healthPermit={healthPermit}
                                />
                            </Paragraph>
                        </Flex>
                    )
                })
            }

            </Flex>
            <Modal title="Eliminar Contribuyente"
                data-test='business-delete-modal'
                open={isDeleteOfficeModalOpen}
                onOk={handleDeleteOffice}
                onCancel={handleCancelDeletion}>
                <p>¿Seguro que deseas eliminar esta sede?</p>
            </Modal>
    </>
    )
}

function ContactDisplay({ contact, role }): JSX.Element {
    const {businessId} = useParams()
    const navigate = useNavigate()


    return (
        <>
            <Flex gap={'middle'} align='center'>

                <Title level={4}>
                    {role}
                </Title>
                <Button onClick={() => {
                    navigate(`/contacts/${contact.id}/edit?redirect=/business/${businessId}`)
                    }}>
                    Editar
                </Button>
            </Flex>

            {contact?.firstName
                ? (
                    <Flex gap={'middle'}>
                        <Image
                            data-test="business-details-owner-pfp"
                            width={150}
                            src={completeUrl(contact.profilePictureUrl)}
                        />
                        <Paragraph>
                            Nombres y Apellidos: {contact.firstName + " " + contact.lastName}<br />
                            Cédula: {contact.dni}<br />
                            Phone: {contact.phone}<br />
                            Whatsapp: {contact.whatsapp}<br />
                            Correo: {contact.email}<br />
                        </Paragraph>
                    </Flex>
                ) : (
                    <Paragraph>
                        Sin datos
                    </Paragraph>
                )}
        </>
    )
}

function Permits({ firefighterPermit, healthPermit }): JSX.Element {

    console.log({ firefighterPermit, healthPermit })


    return (
        <>
            <Title level={4}>Permisos</Title>
            { firefighterPermit 
                ? (<PermitRender data={firefighterPermit} title={"Permiso de Bomberos"}/>) 
                : <Paragraph>No hay permiso de bomberos registrado</Paragraph>
            }

            { healthPermit 
                ? (<PermitRender data={healthPermit} title={"Permiso de Sanidad"}/>) 
                : <Paragraph>No hay permiso de sanidad registrado</Paragraph>
            }

        </>
    )
}

function PermitRender({data, title}) {
    const expirationDate = new Date(data.expirationDate)
    return (
        <>
            <Title level={5}>
                {title}
            </Title>
            <Paragraph>
                Expira: {expirationDate.toLocaleDateString()}

                {
                    data.docImages?.map(image => {
                        return (
                            <div key={image.id}>
                                <a
                                    target="_blank"
                                    href={api.completeUrl(image.url)}> Pagina #{image.pageNumber}
                                </a><br/>
                            </div>
                        )
                    })
                }
            </Paragraph>
        </>
    )
}



export default BusinessViewDetails