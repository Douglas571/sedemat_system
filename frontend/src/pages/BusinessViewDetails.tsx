import React, { useEffect } from 'react'
import { FormProps } from 'antd'
import { Form, Input, Button, message, Typography } from 'antd'
const { Title, Paragraph } = Typography
import { useParams } from 'react-router-dom';

import * as api from '../util/api'
import { TypeIcon } from 'antd/es/message/PurePanel';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type Business = {
    businessName: string
    dni: string 
    email: string 
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
            setBusiness({...fetchedBusiness, branchOffices})       
        }
    }

    return (
        <div>
            <Typography>
                <Title>
                    {business?.businessName || "Cargando..."}
                </Title>
                <Title level={3}>
                    Detalles
                </Title>
                <Paragraph>
                    RIF: {business?.dni}
                </Paragraph>


                <Title level={3}>
                    Licencias
                </Title>
                <Title level={4}>
                    Sede #1
                </Title>
                <Paragraph>Actividad Comercial</Paragraph>

                <Paragraph>Dirección</Paragraph>

                <Paragraph>Horario</Paragraph>

                <Paragraph>Fecha de Emisión</Paragraph>

                <Paragraph>Fecha de Vencimiento</Paragraph>


                <Title level={3}>
                    Calculos
                </Title>
            </Typography>
        </div>
    )
}

export default BusinessViewDetails