import React, { useEffect, useState } from 'react'
import { Badge, Card, Descriptions, Divider, FormProps, List, Modal, Space } from 'antd'
import { Form, Input, Button, message, Typography, Select, Flex, Image } from 'antd'
const { Title, Paragraph } = Typography
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';

import type { Business, BranchOffice, License, EconomicActivity } from '../util/api'

import * as api from '../util/api'
import * as businessesApi from '../util/businessesApi'
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

    const [licenseStatus, setLicenseStatus] = useState()

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

        // call the isBusinessEligibleForEconomicLicense function in businessApi and pass the business id
        let status = await businessesApi.isBusinessEligibleForEconomicLicense(Number(businessId))
        console.log({status})

        setLicenseStatus({...status})

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
            <div>
                <Flex align='center' wrap style={{marginBottom: '20px'}}>
                    <Title style={{marginRight: '20px'}}>
                        {business?.businessName || "Cargando..."}    
                    </Title>
                    <Flex gap={'middle'}>
                        <Button
                            data-test="business-edit-button"
                            onClick={() => navigate(`/business/edit/${businessId}`)}>Editar
                        </Button>
                        <Button
                            data-test="business-delete-button"
                            onClick={() => business.id && showModal()}>Eliminar
                        </Button>
                    </Flex>
                </Flex>

                <GeneralInformationDescription
                    business={business}
                />
                <br/>
                
                
                <EconomicActivityDescription
                    economicActivity={business?.economicActivity}
                />

                <Typography.Title level={3}>
                    Licencia De Actividad Economica
                </Typography.Title>
                <Flex>
                    { licenseStatus?.isValid 
                    ? (
                        <Flex vertical>
                            <Paragraph>El Contribuyente es apto para una licencia de actividad económica</Paragraph>
                            <Button>Otorgar Licencia</Button>
                        </Flex>
                    ) : (
                        <>
                            <List 
                                bordered
                                header={<strong>El contribuyente no es apto para la licencia de actividad económica por las siguientes razones:</strong>}
                                dataSource={licenseStatus?.error?.fields}
                                renderItem={
                                    (field) => <List.Item>{field.message}</List.Item>
                                }
                            />
                        </>
                    )}
                </Flex>


                {/* contacts */}
                <Flex vertical gap={'middle'}>
                    <Title level={3}>
                        Encargados
                    </Title>

                    <ContactPreferenceDescription
                        preference={{
                            preferredContact: getCommunicationPreference().preferredContact,
                            preferredChannel: getCommunicationPreference().preferredChannel,
                            sendCalculosTo: getCommunicationPreference().sendCalculosTo,
                            reminderInterval: business.reminderInterval && reminderIntervalMap[business.reminderInterval],
                            preferredChannelType: getPreferredChannelName()
                        }}
                    />

                    <Flex gap='middle' wrap>
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
                    </Flex>
                </Flex>

                {/* coi */}
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

                <Divider />

                <BranchOfficesDisplay
                    branchOffices={business?.branchOffices}
                    onNew={handleNewBranchOffice}
                    onDelete={handleDeleteBranchOffice}
                    onEdit={handleEditBranchOffice}
                    
                />
                {/* <Title level={3}>
                    Calculos
                </Title> */}
            </div>


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
                    Sucursales
                </Title>
                <Button onClick={() => onNew()}>
                    Nueva
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
                                    Sucursal #{index + 1}

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
                                                                Expira:  <Badge 
                                                                    status={new Date(office.leaseDocs[office?.leaseDocs?.length - 1]?.expirationDate) > new Date() ? "success" : "error"} 
                                                                    text={new Date(office.leaseDocs[office?.leaseDocs?.length - 1]?.expirationDate).toLocaleDateString()} 
                                                                />
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

                                

                                {/* <Title level={5}>
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

                                } */}


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
        <Card 
            title={role + ": " + contact.firstName + " " + contact.lastName}
            extra={
                <Button onClick={() => {
                    navigate(`/contacts/${contact.id}/edit?redirect=/business/${businessId}`)
                    }}>
                    Editar
                </Button>
            }

            style={{ maxWidth: 400 }}
        >
            {contact?.firstName
                ? (
                    <Flex gap={'middle'}>
                        <Image
                            data-test="business-details-owner-pfp"
                            width={150}
                            src={completeUrl(contact.profilePictureUrl)}
                        />
                        <Paragraph>
                            Cédula: {contact.dni}<br />
                            Teléfono: {contact.phone}<br />
                            Whatsapp: {contact.whatsapp}<br />
                            Correo: {contact.email}<br />
                        </Paragraph>
                    </Flex>
                ) : (
                    <Paragraph>
                        Sin datos
                    </Paragraph>
                )}
        </Card>
    )
}

function ContactPreferenceDescription({preference}): JSX.Element {

    if (!preference) {
        return <p>Actividad Económica no registrada</p>
    }

    console.log(JSON.stringify(preference))

    let {preferredContact,
        preferredChannel,
        sendCalculosTo,
        reminderInterval,
        preferredChannelType} = preference
    const economicActivityDescriptions = [
        {
            key: '1',
            label: 'Contacto',
            children: preferredContact
        },
        {
            key: '2',
            label: 'Comunicados al',
            children: preferredChannel + ` (${preferredChannelType})`
        },
        {
            key: '3',
            label: 'Enviar Cálculos al',
            children: sendCalculosTo,
        },
        {
            key: '4',
            label: 'Recordad',
            children: reminderInterval
        },
    ]

    return (
        <Descriptions
            title="Preferencias de Comunicación"
            bordered
            items={economicActivityDescriptions}
        />

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

function GeneralInformationDescription({business}): JSX.Element {
    if (!business) { return <></> }

    const generalInformationDescriptions = [
        {
            key: '1',
            label: "RIF",
            children: business?.dni,
            span: 2
        },
        {
            key: '2',
            label: "Fecha de constitución",
            children: business?.companyIncorporationDate ? new Date(business?.companyIncorporationDate).toLocaleDateString() : "-",
            span: 2
        },
        {
            key: '3',
            label: "Fecha de vencimiento",
            children: <>
                <Badge 
                    status={new Date(business?.companyExpirationDate) > new Date() ? "success" : "error"} 
                    text={business?.companyExpirationDate ? new Date(business?.companyExpirationDate).toLocaleDateString() : "-"} 
                />
            </>
            
            ,
            span: 2
        },
        {
            key: '4',
            label: "Fecha de vencimiento de la junta directiva",
            children: <>
                <Badge 
                    status={new Date(business?.directorsBoardExpirationDate) > new Date() ? "success" : "error"} 
                    text={business?.directorsBoardExpirationDate ? new Date(business?.directorsBoardExpirationDate).toLocaleDateString() : "-"} 
                />
            </>
        ,
            span: 2
        },
    ]


    return (
        <Descriptions
            title="Información General"
            bordered
            items={generalInformationDescriptions}
        />
    )
}

function EconomicActivityDescription({economicActivity}): JSX.Element {

    if (!economicActivity) {
        return <p>Actividad Económica no registrada</p>
    }

    console.log(JSON.stringify(economicActivity))

    let { title, code, alicuota, minimumTax} = economicActivity
    const economicActivityDescriptions = [
        {
            key: '1',
            label: 'Código',
            children: code
        },
        {
            key: '2',
            label: 'Ramo',
            children: title
        },
        {
            key: '3',
            label: 'Alicuota',
            children: alicuota + "%",
        },
        {
            key: '4',
            label: 'Mínimo Tributario',
            children: minimumTax + " TCMMV-BCV"
        },
    ]

    return (
        <Descriptions
            title="Actividad Económica"
            bordered
            items={economicActivityDescriptions}
        />

    )
}