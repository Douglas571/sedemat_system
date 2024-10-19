import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { Card, Typography, Button, Flex, Descriptions, Image, Popconfirm, message, Empty } from 'antd';

import * as grossIncomeApi from '../util/grossIncomeApi';
import * as api from '../util/api';

import { IGrossIncome, Business } from '../util/types';
import { completeUrl } from '../util';
import { formatBolivares, formatPercents } from '../util/currency';
import dayjs from 'dayjs';

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
            <Flex justify='space-between' align='center' gap={16}>
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
                    {grossIncome.grossIncomeInvoiceId && (<Button>
                        <Link to={`/tax-collection/${businessId}/gross-incomes-invoice/${grossIncome.grossIncomeInvoiceId}`}>Factura</Link>
                    </Button>)}

                </Flex>
            </Flex>
        )}>

            <BusinessInfo
                business={business}
                grossIncome={grossIncome}
                economicActivityTitle={business?.economicActivity?.title}

            />

            <GrossIncomeInfo grossIncome={grossIncome} />
            <DeclarationImage imageUrl={completeUrl(grossIncome?.declarationImage)} />
        </Card>
    );
};

const BusinessInfo: React.FC<{
    business: Business | undefined,
    grossIncome: IGrossIncome | undefined,
    economicActivityTitle: string | undefined
}> = ({ business, grossIncome, economicActivityTitle }) => {

    if (!grossIncome || !business) return null;


    return (
        <Descriptions title="Información del Negocio" bordered>
            <Descriptions.Item label="Nombre del Negocio">{business.businessName}</Descriptions.Item>
            <Descriptions.Item label="RIF">{business.dni}</Descriptions.Item>
            <Descriptions.Item label="Actividad Económica">{economicActivityTitle}</Descriptions.Item>
            <Descriptions.Item label="Alicuota">{formatPercents(grossIncome.alicuotaTaxPercent)}</Descriptions.Item>
            <Descriptions.Item label="Mínimo Tributario">{grossIncome.alicuotaMinTaxMMVBCV} MMVBCV</Descriptions.Item>
            <Descriptions.Item label="TC-MMVBCV">{formatBolivares(grossIncome.TCMMVBCV)}</Descriptions.Item>
        </Descriptions>
    );
};


const GrossIncomeInfo: React.FC<{ grossIncome: IGrossIncome | undefined }> = ({ grossIncome }) => {
    if (!grossIncome) return null;

    const hasBranchOffice = grossIncome?.branchOffice?.nickname;

    return (
        <Descriptions title="Detalles del Ingreso Bruto" bordered>
            <Descriptions.Item label="Año">{dayjs(grossIncome.period).year()}</Descriptions.Item>
            <Descriptions.Item label="Mes">{dayjs(grossIncome.period).format('MMMM')}</Descriptions.Item>
            <Descriptions.Item label="Monto Declarado">{formatBolivares(grossIncome.amountBs)}</Descriptions.Item>

            {
                hasBranchOffice && (
                <>
                    <Descriptions.Item label="Cobrar Aseo">{grossIncome.chargeWasteCollection ? "SI" : "NO"}</Descriptions.Item>
                    <Descriptions.Item label="Sucursal">{grossIncome?.branchOffice?.nickname}</Descriptions.Item>
                </>   
                )
            }
        </Descriptions>
    );
};

const DeclarationImage: React.FC<{ imageUrl: string | null }> = ({ imageUrl }) => {

    return (
        <Card title="Declaración del SENIAT" style={{ marginTop: 16 }}>
            {
                imageUrl 
                ? (<Image
                    src={imageUrl}
                    alt="Declaración SENIAT"
                    style={{ maxWidth: '100%' }}
                />)
                : (<Empty description={"No hay declaración de ingresos"}/>)
            }
        </Card>
    );
};



export default GrossIncomeDetails;
