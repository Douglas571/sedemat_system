import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { Card, Typography, Button, Flex, Descriptions, Image, Popconfirm, message, Empty } from 'antd';

import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';

import * as grossIncomeApi from '../util/grossIncomeApi';
import * as api from '../util/api';

import { IGrossIncome, Business } from '../util/types';
import { completeUrl } from '../util';
import { CurrencyHandler, formatBolivares, formatPercents } from '../util/currency';
import dayjs from 'dayjs';
import useAuthentication from 'hooks/useAuthentication';

const { Title, Text } = Typography;

const GrossIncomeDetails: React.FC = () => {
    const { grossIncomeId, businessId } = useParams();
    const [grossIncome, setGrossIncome] = React.useState<IGrossIncome>();
    const [business, setBusiness] = React.useState<Business>();
    const navigate = useNavigate();

    const {userAuth} = useAuthentication();

    console.log({grossIncome})

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
                await grossIncomeApi.deleteGrossIncome(grossIncome.id, userAuth.token ?? null);
                navigate(-1);
            } catch (error) {
                message.error('Error al eliminar el ingreso bruto: ' + (error as Error).message);
            }
        }
    }

    if (!grossIncome) return "cargando...";

    return (
        <Card title={(
            <Flex justify='space-between' align='center' gap={16} wrap>
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

            <br/>

            <GrossIncomeInfo grossIncome={grossIncome} />

            <br/>

            {
                // ! TODO: Delete this code duplication after migrating the existing images to their own support files 
                grossIncome.declarationImage 
                ? (<DeclarationImage imageUrl={completeUrl(grossIncome.declarationImage)}/>)
                : (<Card>
                    <Flex gap='middle' vertical>
                        {
                            grossIncome?.supportFiles.length > 0 
                            ? (<Flex vertical gap={10}>
                                    <Flex wrap gap={10}>
                                        {
                                            grossIncome.supportFiles.filter(sf => sf.type === 'image').map(sf => (
                                                <Image 
                                                    src={sf.url} 
                                                    key={sf.id}
                                                    style={{
                                                        maxWidth: '200px'
                                                    }}
                                                />
                                            ))
                                        }
                                    </Flex>
                                    <Flex gap={10}>
                                        {
                                            grossIncome?.supportFiles.filter(sf => sf.type !== 'image').map( f => {
                                                let icon = null
                                                let iconProps = {
                                                    style: {
                                                        fontSize: '1.5em'
                                                    }
                                                }
    
                                                if (f.url.endsWith('.pdf')) {
                                                    icon = <FilePdfOutlined {...iconProps}/>
                                                }
    
                                                if (f.url.endsWith('.xlsx') || f.url.endsWith('.xls') || f.url.endsWith('.xlsm')) {
                                                    icon = <FileExcelOutlined {...iconProps}/>
                                                }
    
                                                return (
                                                    <Card>
                                                        <Flex gap={10}>
                                                            {icon}
                                                            <a href={f.url} target="_blank" rel="noopener noreferrer">
                                                            {f.description ?? 'Archivo adjunto'}
                                                        </a>
                                                        </Flex>
                                                    </Card>
                                                )
                                                    
                                            })
                                        }
                                    </Flex>
    
    
                                </Flex>)
                            : (
                                <Empty description={"No hay declaración de ingresos"}/>
                            )
                        }
                    </Flex>
                </Card>)
            }
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
        <Descriptions 
            title="Información del Negocio" 
            bordered
            size='small'
            
            layout='vertical'
        >
            <Descriptions.Item label="Nombre del Negocio">{business.businessName}</Descriptions.Item>
            <Descriptions.Item label="RIF"><div style={{ minWidth: '100px' }}>{business.dni}</div></Descriptions.Item>
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

    let createdByUserPersonFullName = grossIncome?.createdByUser?.person?.firstName + ' ' + grossIncome?.createdByUser?.person?.lastName
    let updatedByUserPersonFullName = grossIncome?.updatedByUser?.person?.firstName + ' ' + grossIncome?.updatedByUser?.person?.lastName

    return (
        <Descriptions 
            title="Detalles del Ingreso Bruto" 
            bordered
            size='small'

            layout='vertical'
        >

            <Descriptions.Item label="Creado por">{createdByUserPersonFullName}</Descriptions.Item>
            {
                grossIncome.updatedByUserId && (
                    <Descriptions.Item label="Actualizado por">{updatedByUserPersonFullName}</Descriptions.Item>
                )
            }
            <Descriptions.Item label="Declarado el">{dayjs(grossIncome.declaredAt).format('DD [de] MMMM [de] YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Periodo">{dayjs(grossIncome.period).format('MMMM YYYY').toUpperCase()}</Descriptions.Item>
            <Descriptions.Item 
                label="Monto Declarado"
            >
                
                <div style={{ fontWeight: 'bold' }}>{formatBolivares(grossIncome.amountBs)}</div>

            </Descriptions.Item>

            {
                hasBranchOffice && (
                <>
                    <Descriptions.Item label="Cobrar Aseo">{grossIncome.chargeWasteCollection ? "SI" : "NO"}</Descriptions.Item>
                    <Descriptions.Item label="Sede">{grossIncome?.branchOffice?.nickname}</Descriptions.Item>
                </>   
                )
            }
            <Descriptions.Item label="Impuesto">{formatBolivares(grossIncome.taxInBs)}</Descriptions.Item>
            <Descriptions.Item label="Aseo">{formatBolivares(grossIncome.wasteCollectionTaxInBs)}</Descriptions.Item>
            <Descriptions.Item label="Min. Tributario">{formatBolivares(grossIncome.minTaxInBs)}</Descriptions.Item>
            <Descriptions.Item 
                label="Total a Pagar"
            >
                <div style={{ fontWeight: 'bold' }}>
                    {formatBolivares(grossIncome.totalTaxInBs)}
                </div>
            </Descriptions.Item>

            
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
