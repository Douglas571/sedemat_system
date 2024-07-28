import React, { useEffect, useState } from 'react'
import { FormProps, Modal, Space } from 'antd'
import { Form, Input, Button, message, Typography, Select} from 'antd'
const { Title, Paragraph } = Typography
import { useParams, Link, useNavigate } from 'react-router-dom';

import type {Business, BranchOffice, License, EconomicActivity} from '../util/api'

import * as api from '../util/api'
import { TypeIcon } from 'antd/es/message/PurePanel';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

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

    useEffect(() => {
        console.log({business})
    }, [business])

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

    return (
        <div>
            <Typography>
                <Title>
                    {business?.businessName || "Cargando..."} 
                    <Button onClick={() => navigate(`/business/edit/${businessId}`)}>Editar</Button> 
                    <Button 
                        data-test="business-delete-button"
                        onClick={() => business.id && showModal()}>Eliminar</Button>
                </Title>
                <Title level={2}>
                    Detalles
                </Title>
                <Paragraph>
                    RIF: {business?.dni}<br/>
                    Fecha de constitución: {business.companyIncorporationDate.toString()}<br/>
                    Fecha de vencimiento: {business.companyExpirationDate.toString()}<br/>
                    Fecha de vencimiento de la junta directiva: {business.directorsBoardExpirationDate.toString()}
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
                <Title level={4}>
                    Propietario
                </Title>
                { business.owner ? (
                    <>
                        <Paragraph>
                            Nombres y Apellidos: {business.owner.firstName + " " + business.owner.lastName}<br/>
                            Cédula: {business.owner.dni}<br/>
                            Phone: {business.owner.phone}<br/>
                            Whatsapp: {business.owner.whatsapp}<br/>
                            Correo: {business.owner.email}<br/>
                        </Paragraph>
                    </>
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
                            Nombres y Apellidos: {business.accountant.firstName + " " + business.owner.lastName}<br/>
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
                            Nombres y Apellidos: {business.administrator.firstName + " " + business.owner.lastName}<br/>
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
                {
                    business?.branchOffices.map( (office, index) => {
                        const lastEconomicLicense = office?.EconomicLicenses?.slice(-1)[0]
                        console.log({office})
                        console.log({lastEconomicLicense})

                        return (
                            <>
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
                                    Procedencia: {office.origin}<br/>

                                    
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
                            </>
                        )
                    })
                }


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