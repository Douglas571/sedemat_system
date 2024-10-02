import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Card, Typography, Button, Flex, Descriptions, Image, Popconfirm, message } from 'antd';

import * as grossIncomeApi from '../util/grossIncomeApi';
import * as api from '../util/api';

import { IGrossIncome, Business } from '../util/types';
import { completeUrl } from '../util';

const { Title, Text } = Typography;

const GrossIncomeDetails: React.FC = () => {
    const { grossIncomeId, businessId } = useParams();
    const [grossIncome, setGrossIncome] = React.useState<IGrossIncome>();
    const [business, setBusiness] = React.useState<Business>();
    const navigate = useNavigate();
    
    useEffect(() => {
        loadGrossIncome();
        loadBusiness();
    }, []);

    async function loadGrossIncome() {
        const fetchedGrossIncome = await grossIncomeApi.getGrossIncomeById(Number(grossIncomeId));
        setGrossIncome(fetchedGrossIncome);
        console.log({ fetchedGrossIncome })
    }

    async function loadBusiness() {
        const fetchedBusiness = await api.fetchBusinessById(Number(businessId));
        setBusiness(fetchedBusiness);
        console.log({ fetchedBusiness })
    }

    async function handleDelete() {
        if (grossIncome?.id) {
            try {
                await grossIncomeApi.deleteGrossIncome(grossIncome.id);
                navigate(-1);
            } catch (error) {
                message.error('Error al eliminar el ingreso bruto: ' + (error as Error).message);
            }
        }
    }

    if (!grossIncome) return "cargando...";

    return (
        <Card title={(
            <Flex justify='space-between' align='center'>
                <Title level={2}>Ingresos Brutos Declarados</Title>
                <Flex gap={10}>
                    <Button onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes/${grossIncomeId}/edit`)}>Editar</Button>
                    <Popconfirm
                        title="¿Estás seguro de que quieres eliminar este ingreso bruto?"
                        onConfirm={handleDelete}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger>Eliminar</Button>
                    </Popconfirm>
                </Flex>
            </Flex>
        )}>

            <BusinessInfo 
                business={business} 
                alicuotaTaxPercent={`${grossIncome.alicuota.taxPercent * 100}%`}
                minTaxMMV={`${grossIncome.alicuota.minTaxMMV} MMV-BCV`}

            />

            <GrossIncomeInfo grossIncome={grossIncome} />
            <DeclarationImage imageUrl={completeUrl(grossIncome?.declarationImage)} />
        </Card>
    );
};

const BusinessInfo: React.FC<{ 
    business: Business | undefined 
    alicuotaTaxPercent: string | undefined 
    minTaxMMV: string | undefined
}> = ({ business, alicuotaTaxPercent, minTaxMMV }) => {
    if (!business) return null;

    return (
        <Descriptions title="Información del Negocio" bordered>
            <Descriptions.Item label="Nombre del Negocio">{business.businessName}</Descriptions.Item>
            <Descriptions.Item label="RIF">{business.dni}</Descriptions.Item>
            <Descriptions.Item label="Actividad Económica">{business.economicActivity?.title}</Descriptions.Item>
            <Descriptions.Item label="Alicuota">{alicuotaTaxPercent}</Descriptions.Item>
            <Descriptions.Item label="Mínimo Tributario">{minTaxMMV}</Descriptions.Item>
        </Descriptions>
    );
};


const GrossIncomeInfo: React.FC<{ grossIncome: IGrossIncome | undefined }> = ({ grossIncome }) => {
    if (!grossIncome) return null;

    return (
        <Descriptions title="Detalles del Ingreso Bruto" bordered>
            <Descriptions.Item label="Año">{grossIncome.period.year()}</Descriptions.Item>
            <Descriptions.Item label="Mes">{grossIncome.period.format('MMMM')}</Descriptions.Item>
            <Descriptions.Item label="Monto Declarado">{`${grossIncome.amountBs} Bs.`}</Descriptions.Item>
            <Descriptions.Item label="Cobrar Aseo">{ grossIncome.wasteCollectionTaxId ? "SI" : "NO" }</Descriptions.Item>
            <Descriptions.Item label="Sucursal">{grossIncome.branchOffice.nickname}</Descriptions.Item>
        </Descriptions>
    );
};

const DeclarationImage: React.FC<{ imageUrl: string | undefined }> = ({ imageUrl }) => {
    if (!imageUrl) return null;

    return (
        <Card title="Declaración SENIAT" style={{ marginTop: 16 }}>
            <Image
                src={imageUrl}
                alt="Declaración SENIAT"
                style={{ maxWidth: '100%' }}
            />
        </Card>
    );
};



export default GrossIncomeDetails;
