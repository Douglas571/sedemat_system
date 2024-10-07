import zamoraFlagUrl from '/images/zamora_flag.png'


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import { Card, Typography, Table, Descriptions, List, Flex} from 'antd';
const { Title, Text } = Typography;

import dayjs from 'dayjs'

import { Business } from 'util/types';
import { IGrossIncomeInvoice, IGrossIncome, CurrencyExchangeRate } from '../util/types';
import * as grossIncomeApi from '../util/grossIncomeApi'
import * as api from '../util/api'
import * as util from '../util'
import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import useAuthentication from 'hooks/useAuthentication';
import { CurrencyHandler,formatBolivares, formatPercents } from 'util/currency';

const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { businessId, grossIncomeInvoiceId } = useParams()
    console.log({businessId, grossIncomeInvoiceId})

    const { userAuth } = useAuthentication()
    console.log({userAuth})

	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()

    const hasBranchOffice = grossIncomes?.length > 0 && grossIncomes[0]?.branchOfficeId !== undefined
    const branchOffice = hasBranchOffice && grossIncomes[0]?.branchOffice

    const createdByUser = grossIncomeInvoice?.createdByUser
    const createdByPerson = createdByUser?.person
    console.log({grossIncomeInvoice})

    const getWeekRange = (date: Date) => {
        // being aware that Monday is the start of the week 
        const start = dayjs(date).startOf('week').add(1, 'day');
        const end = dayjs(date).endOf('week').subtract(1, 'day');

        console.log({start: String(start), end: String(end)})
        return {start, end};
    }

    // const branchOfficeDimensions = grossIncomes ? grossIncomes.branchOffices[0].dimensions : 0;
    // console.log({branchOfficeDimensions})

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
        return fetchedGIs.sort((a, b) => new dayjs(a.period) - new dayjs(b.period))
    }

    const loadData = async () => {
        console.log("here")

        const fetchedLastCurrencyExchangeRate = await loadLastCurrencyExchangeRate()
        // load the business
        const fetchedBusiness = await loadBusiness()
        // load the invoice 
        const fetchedInvoice = await loadGrossIncomeInvoice()
        // load gross incomes 
        const fetchedGrossIncomes = await loadGrossIncomes(Number(grossIncomeInvoiceId))

        
        // console.log(JSON.stringify({fetchedBusiness, fetchedGrossIncomes, fetchedInvoice}, null, 2))
        setLastCurrencyExchangeRate(fetchedLastCurrencyExchangeRate)
        setBusiness(fetchedBusiness)
        setGrossIncomeInvoice(fetchedInvoice)
        setGrossIncomes(fetchedGrossIncomes)
        
    }

    useEffect(() => {
        loadData()
    }, [])

    let TCMMVBCV = grossIncomeInvoice?.TCMMVBCV ?? 1
    

    console.log({lastCurrencyExchangeRate, TCMMVBCV})

    if (!business) {
        return <Flex align="center" justify="center">Cargando...</Flex>
    }

    const {formPriceBs} = grossIncomeInvoice
    const TOTAL = util.calculateTotalGrossIncomeInvoice(grossIncomes, business, formPriceBs)

    return (
        <Flex vertical>

            <Flex align='center' justify='center' gap={10}>
                <img src={"/images/zamora_flag.png"} width={100} alt="Zamora Flag" />
                <img src={"/images/zamora_shield.png"} width={100} alt="Zamora Shield" />
                <Flex style={{maxWidth: "350px", textAlign: 'center', fontFamily: "Arial"}}>
                    REPÚBLICA BOLIVARIANA DE VENEZUELA<br/>
                    ALCALDIA DEL MUNICIPIO ZAMORA ESTADO FALCÓN
                </Flex>
                <img src={"/images/sedemat_logo.png"} width={100} alt="SEDEMAT Shield" />
            </Flex>
            <Flex justify='right'>
                <Text>Fecha: {dayjs().format('YYYY-MM-DD')}</Text>
            </Flex>

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
                    render={(amountBs: number) => formatBolivares(amountBs)}
                />
                <Table.Column 
                    title="Alicuota"
                    key="amountBs" 
                    render={(_: any, grossIncome: IGrossIncome) => formatPercents(grossIncome.alicuotaTaxPercent)}
                    width="8%"
                    align="center"
                />
                <Table.Column 
                    title="Impuesto" 
                    dataIndex="amountBs" 
                    key="tax" 
                    render={(_: number, record: any) => {
                        const {amountBs} = record
                        const alicuotaTaxPercent = record.alicuotaTaxPercent

                        let tax = CurrencyHandler(amountBs).multiply(alicuotaTaxPercent).format()

                        return tax
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Min. Trib." 
                    dataIndex={['business', 'economicActivity', 'minTax']} 
                    key="minTax" 
                    render={(_: number, record: IGrossIncome) => {
                        let minTax = CurrencyHandler(record.alicuotaMinTaxMMVBCV)
                                    .multiply(record.TCMMVBCV)
                                    .format()

                        return minTax
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Aseo" 
                    key="aseo"
                    dataIndex='wasteCollectionTax'
                    width="15%"
                    render={(_: any, record: IGrossIncome) => {
                        let wasteCollectionTax = CurrencyHandler(util.getWasteCollectionTaxInBs(record))
                        .format()

                        return wasteCollectionTax
                    }}
                />
                <Table.Column 
                    title="Subtotal" 
                    key="subtotal" 
                    render={(text: any, record: any) => {
                        let subtotal = util.getSubTotalFromGrossIncome(record, business)

                        return formatBolivares(subtotal)
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
                            <Text style={{ float: 'right' }}>{formatBolivares(grossIncomeInvoice?.formPriceBs ?? 0)}</Text>
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
                    render={(text: any) => <Text strong>{formatBolivares(TOTAL)}</Text>}
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
                    render={(text: any) => <Text strong>{`${CurrencyHandler(TOTAL).divide(TCMMVBCV).format()} MMVBCV` }</Text>}
                />
            </Table>
            <Typography.Paragraph style={{ textAlign: 'center', paddingTop: '10px', paddingBottom: '10px' }} strong>Tasa de cambio de la Moneda de Mayor Valor dle Banco Central de Venezuela (TCMMVBCV)={formatBolivares(TCMMVBCV)} desde el día {getWeekRange(grossIncomeInvoice?.updatedAt).start.format('DD/MM/YYYY')} hasta el {getWeekRange(grossIncomeInvoice?.updatedAt).end.format('DD/MM/YYYY')}.</Typography.Paragraph>

            
            <Descriptions bordered layout='vertical' size='small'>
                <Descriptions.Item label="Creado por" style={{ width: '20%' }} >{grossIncomeInvoice?.createdByUserPersonFullName}</Descriptions.Item>
                <Descriptions.Item label="Revisado por" style={{ width: '20%' }} >{grossIncomeInvoice?.checkedByUserPersonFullName}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ textAlign: 'center' }}>Datos para Depósitos y/o Transferencias a Nombre de SEDEMAT</Title>
            <Descriptions bordered size='small'>
                <Descriptions.Item label="Rif" span={1}>G-20012768-6</Descriptions.Item>
                <Descriptions.Item label="Correo" span={3}>SEDEMATZAMORAFALCON.8@GMAIL.COM</Descriptions.Item>

                <Descriptions.Item label="Banco de Venezuela" span={2}>Corriente 0102-0339-2500-0107-1892</Descriptions.Item>
                <Descriptions.Item label="Banco Bicentenario" span={2}>Corriente 0175-0162-3100-7494-9290</Descriptions.Item>
            </Descriptions>
        </Flex>
    );
};

export default GrossIncomeInvoiceDetails;
