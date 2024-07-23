import React, { useEffect } from 'react'
import { FormProps } from 'antd'
import { Form, Input, Button, message, Typography } from 'antd'
const { Title, Paragraph } = Typography
import { useParams, Link } from 'react-router-dom';

import * as api from '../util/api'
import { TypeIcon } from 'antd/es/message/PurePanel';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type EconomicActivity = {
    title: string,
    alicuota: number 
    minimumTax: number
}

type License = {
    EconomicActivity: EconomicActivity
    openAt: Date
    closeAt: Date
    issuedDate: Date
    expirationDate: Date
}

type BranchOffice = {
    id: number
    address: string
    phone: string
    EconomicLicenses?: Array<License>
    lastEconomicLicense?: License;
}
type Business = {
    businessName: string
    dni: string 
    email: string,
    branchOffices: Array<BranchOffice>
}

function BusinessViewDetails(): JSX.Element {
    let [business, setBusiness] = React.useState<Business>()
    let { businessId } = useParams();

    useEffect(() => {
        // first load of data
        loadBusinessData()
    }, [])

    useEffect(() => {
        console.log({business})
    }, [business])

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

    const license = {
        expirationDate: '2022-12-31'
    };

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

    return (
        <div>
            <Typography>
                <Title>
                    {business?.businessName || "Cargando..."} <Link to={`/business/edit/${businessId}`}>Editar</Link>
                </Title>
                <Title level={3}>
                    Detalles
                </Title>
                <Paragraph>
                    RIF: {business?.dni}
                </Paragraph>
                <Paragraph>
                    Actividad Económica: 
                </Paragraph>
{/*                 

                <Title level={3}>
                    Datos del dueño
                </Title>
                <Paragraph>
                    Nombres y Apellidos: 
                </Paragraph>
                <Paragraph>
                    Cédula: 
                </Paragraph> */}
                {/*<Title level={3}>
                    Licencias
                </Title> */}
                {
                    business?.branchOffices.map( office => {
                        const lastEconomicLicense = office?.EconomicLicenses?.slice(-1)[0]
                        console.log({office})
                        console.log({lastEconomicLicense})

                        return (
                            <>
                                <Title level={4}>
                                    Sede #1 {renderLicenseButton(office)}
                                </Title>
                                <Paragraph>Actividad Económica: {lastEconomicLicense?.EconomicActivity.title}</Paragraph>
                                <Paragraph>Alicuota: {lastEconomicLicense?.EconomicActivity.alicuota}</Paragraph>
                                <Paragraph>Mínimo tributario: {lastEconomicLicense?.EconomicActivity.minimumTax}</Paragraph>

                                <Paragraph>Dirección: {office.address}</Paragraph>
                                <Paragraph>Teléfono: {office.phone} </Paragraph>

                                {/* <Paragraph>Horario</Paragraph> */}

                                <Paragraph>Fecha de Emisión: {String(lastEconomicLicense?.issuedDate)}</Paragraph>
                                <Paragraph>Fecha de Vencimiento: {String(lastEconomicLicense?.expirationDate)}</Paragraph>
                            </>
                        )
                    })
                }


                <Title level={3}>
                    Calculos
                </Title>
            </Typography>
        </div>
    )
}

export default BusinessViewDetails