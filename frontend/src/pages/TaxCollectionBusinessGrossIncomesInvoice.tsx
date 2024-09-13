import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Table, Descriptions, List, Flex, Button} from 'antd';
const { Title, Text } = Typography;

import dayjs from 'dayjs'
import { Business } from 'util/types';
import { IGrossIncomeInvoice, IGrossIncome } from '../util/types';
import * as grossIncomeApi from '../util/grossIncomeApi'
import * as api from '../util/api'
import * as util from '../util'
import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';


const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { businessId, grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()

	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()

    const hasBranchOffice = grossIncomes?.length > 0 && grossIncomes[0]?.branchOfficeId !== undefined
    const branchOffice = hasBranchOffice && grossIncomes[0]?.branchOffice

    let MMVExchangeRate = 0 

    if (lastCurrencyExchangeRate) {
        
        MMVExchangeRate = Math.max(
            lastCurrencyExchangeRate.dolarBCVToBs, 
            lastCurrencyExchangeRate.eurosBCVToBs
        );
    }

    console.log(lastCurrencyExchangeRate)
    

    const loadLastCurrencyExchangeRate = async (): Promise<CurrencyExchangeRate> => {
        const lastCurrencyExchangeRate = await CurrencyExchangeRatesService.getLastOne()
        console.log({lastCurrencyExchangeRate})

        return lastCurrencyExchangeRate
    }

    const loadBusiness = async (): Promise<Business> => {
        return api.fetchBusinessById(Number(businessId))
    }

    const loadGrossIncomeInvoice = async (): Promise<IGrossIncomeInvoice> => {
        return GrossIncomesInvoiceService.getById(Number(grossIncomeInvoiceId))
    }

    const loadGrossIncomes = async (grossIncomeInvoiceId: number): Promise<IGrossIncome[]> => {
        const fetchedGIs = await grossIncomeApi.getAllGrossIncomesByInvoiceId(grossIncomeInvoiceId)
        return fetchedGIs
    }

    const loadData = async () => {

        const lastCER = await loadLastCurrencyExchangeRate()

        // load the business
        const fetchedBusiness = await loadBusiness()
        // load the invoice 
        const fetchedInvoice = await loadGrossIncomeInvoice()
        // load gross incomes 
        const fetchedGrossIncomes = await loadGrossIncomes(Number(grossIncomeInvoiceId))

        // console.log(JSON.stringify({fetchedBusiness, fetchedGrossIncomes, fetchedInvoice}, null, 2))

        setLastCurrencyExchangeRate(lastCER)
        setBusiness(fetchedBusiness)
        setGrossIncomeInvoice(fetchedInvoice)
        setGrossIncomes(fetchedGrossIncomes)
    }

    useEffect(() => {
        loadData()
    }, [])

	// Dummy data
	const invoiceDetails = {
        currencyExchangeRates: {
            id: 1,
            dolarBCV: 38,
            euroBCV: 43,
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        createdByUser: {
            person: {
                firstName: 'Jose',
                lastName: 'Herrera',
            },
        },

        checkedByUser: {
            person: {
                firstName: 'Hipólita',
                lastName: 'Gonzales',
            },
        },
	};

    if (!business) {
        return <Flex align="center" justify="center">Cargando...</Flex>
    }

    const {formPriceBs} = grossIncomeInvoice
    const TOTAL = util.calculateTotalGrossIncomeInvoice(grossIncomes, business, formPriceBs)

    return (
        <Card title={<Flex align='center' justify='space-between'>
            <Typography.Title level={4}>Detalles del Calculo</Typography.Title>
            <Button onClick={() => navigate(`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}`)}>Imprimir</Button>
        </Flex>}>

            <Title level={5} style={{ textAlign: 'center' }}>Descripción del Contribuyente</Title>
            <Descriptions bordered  size='small'>
                <Descriptions.Item label="Contribuyente" style={{ maxWidth: '20%' }} >{business.businessName}</Descriptions.Item>
                <Descriptions.Item label="Rif" style={{ maxWidth: '15%' }}>{business.dni}</Descriptions.Item>
                <Descriptions.Item label="N°" style={{ maxWidth: '12%' }}>{business.economicActivity.code}</Descriptions.Item>

                {
                    branchOffice
                    ? (
                        <>
                            <Descriptions.Item label="Ramo" style={{ maxWidth: '20%' }}>{business.economicActivity.title}</Descriptions.Item>
                            <Descriptions.Item label="Mts2" style={{ maxWidth: '5%' }}>{branchOffice.dimensions}</Descriptions.Item>
                            <Descriptions.Item label="Tipo"  style={{ maxWidth: '5%' }}>{branchOffice.type}</Descriptions.Item>
                        </>
                    )
                    : (null)
                }
            </Descriptions>

            <Title level={5} style={{ textAlign: 'center' }}>Estado de Cuenta</Title>

            <Table 
                size='small'
                dataSource={grossIncomes ? grossIncomes : []} 
                pagination={false}
            >
                <Table.Column 
                    title="Periodo" 
                    dataIndex="period" 
                    key="period" 
                    render={(period: Date) => dayjs(period).format('MMM-YY')}
                />
                <Table.Column 
                    title="Ingreso" 
                    dataIndex="amountBs" 
                    key="amountBs" 
                    render={(amountBs: number) => `${amountBs} Bs.`}
                />
                <Table.Column 
                    title="Alicuota"
                    key="amountBs" 
                    render={(_: any) => `${business.economicActivity.alicuota * 100}%`}
                    width="8%"
                    align="center"
                />
                <Table.Column 
                    title="Impuesto" 
                    dataIndex="amountBs" 
                    key="tax" 
                    render={(amountBs: number, record: any) => {
                        const tax = amountBs * business.economicActivity.alicuota;
                        return `${tax.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Min. Trib." 
                    dataIndex={['business', 'economicActivity', 'minTax']} 
                    key="minTax" 
                    render={(minTax: number, record: IGrossIncome) => {
                        const cer = record.currencyExchangeRate
                        const {economicActivity} = business
                        const MMVExchangeRate = util.getMMVExchangeRate(cer)
                        const minTaxThreshold = economicActivity.minimumTax * MMVExchangeRate;
                        console.log({cer, economicActivity, MMVExchangeRate, minTax})
                        return `${minTaxThreshold.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Aseo" 
                    key="aseo"
                    dataIndex='wasteCollectionTax'
                    width="15%"
                    render={(_: any, record: IGrossIncome) => {
                        if (!branchOffice) {
                            return 0
                        }
                        const tax = util.getWasteCollectionTaxInBs(record)
                        return `${tax} Bs.`
                    }}
                />
                <Table.Column 
                    title="Subtotal" 
                    key="subtotal" 
                    render={(text: any, record: any) => {
                        const tax = util.getSubTotalFromGrossIncome(record, business)
                        return `${tax.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                    align="right"
                />
            </Table>

            <Table 
                size='small'
                dataSource={[{ formularyPrice: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Formulary Price" 
                    key="formularyPrice" 
                    render={() => (
                        <>
                            <Text>Formulario</Text>
                            <Text style={{ float: 'right' }}>{grossIncomeInvoice.formPriceBs} Bs.</Text>
                        </>
                    )}
                />
            </Table>
            
            <Table 
                size='small'
                dataSource={[{ total: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Total" 
                    key="total" 
                    render={(text: any) => <Text strong>Total en Bs</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Total en Bs" 
                    key="total" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{TOTAL} Bs.</Text>}
                />
            </Table>

            <Table 
                size='small'
                dataSource={[{ total: 40 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Total" 
                    key="total" 
                    render={(text: any) => <Text strong>Total en MMV</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Total en Bs" 
                    key="total" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{Number(TOTAL / MMVExchangeRate).toFixed(2)} MMV</Text>}
                />
            </Table>
            <Typography.Paragraph style={{ textAlign: 'center', paddingTop: '10px', paddingBottom: '10px' }} strong>Tasa de cambio de la Moneda de Mayor Valor dle Banco Central de Venezuela (TCMMV)={MMVExchangeRate}Bs. desde el día 19/08/224 hasta el 23/08/2024.</Typography.Paragraph>

            
            <Descriptions bordered layout='vertical' size='small'>
                <Descriptions.Item label="Creado por" style={{ width: '20%' }} >{invoiceDetails.createdByUser.person.firstName} {invoiceDetails.createdByUser.person.lastName}</Descriptions.Item>
                <Descriptions.Item label="Revisado por" style={{ width: '20%' }} >{invoiceDetails.checkedByUser.person.firstName} {invoiceDetails.checkedByUser.person.lastName}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ textAlign: 'center' }}>Datos para Depósitos y/o Transferencias a Nombre de SEDEMAT</Title>
            <Descriptions bordered size='small'>
                <Descriptions.Item label="Rif" span={1}>G-20012768-6</Descriptions.Item>
                <Descriptions.Item label="Correo" span={3}>SEDEMATZAMORAFALCON.8@GMAIL.COM</Descriptions.Item>

                <Descriptions.Item label="Banco de Venezuela" span={2}>Corriente 0102-0339-2500-0107-1892</Descriptions.Item>
                <Descriptions.Item label="Banco Bicentenario" span={2}>Corriente 0175-0162-3100-7494-9290</Descriptions.Item>
            </Descriptions>


            
        </Card>
    );
};

export default GrossIncomeInvoiceDetails;


function calculateTax(grossIncome: any, MMVExchangeRate: number) {
    if (!business) {
        return 0 
    }

    // Calculate the tax based on the gross income amount and alicuota
    const calculatedTax = grossIncome.amountBs * business.economicActivity.alicuota;

    // Get the minimum tax value
    const minTax = grossIncome.business.economicActivity.minTax;

    // Calculate the minimum tax threshold
    const minTaxThreshold = minTax * MMVExchangeRate;

    // Return the higher of the calculated tax and the minimum tax threshold
    return Math.max(calculatedTax, minTaxThreshold);
}
    

// a function to given the whole invoice details, calculate the total in bolivarse and mmv
function calculateTotal(invoiceDetails: any) {
    // calculate the total in bolivarse
    const totalBs = invoiceDetails.grossIncomes.reduce((acc: any, curr: any) => acc + curr.amountBs, 0);

    // calculate the total in mmv
    const totalMMV = totalBs / MMVExchangeRate;

    return { totalBs, totalMMV };
    
}

