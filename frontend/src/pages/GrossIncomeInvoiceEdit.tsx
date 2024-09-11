import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Table, Button, message, Typography, Form, Select, InputNumber } from 'antd'
import { ColumnsType } from 'antd/es/table'

import { IGrossIncome, BranchOffice, Business, CurrencyExchangeRate, IGrossIncomeInvoiceCreate } from '../util/types' // Importing IGrossIncome from types
import * as grossIncomeApi from '../util/grossIncomeApi'
import * as api from '../util/api'
import currencyExchangeRatesService from '../services/CurrencyExchangeRatesService'
import grossIncomesInvoiceService from '../services/GrossIncomesInvoiceService'
import dayjs from 'dayjs'

import * as util from '../util'

const dummyData: IGrossIncome[] = [
    {
        id: 1,
        businessId: 101,
        business: {
            id: 101,
            name: 'Business A'
            // Add other required Business properties
        },
        branchOfficeId: 201,
        branchOffice: {
            id: 201,
            nickname: 'Main Office'
            // Add other required BranchOffice properties
        },
        period: dayjs('2023-01'), // Convert period into dayjs object
        amountBs: 10000,
        chargeWasteCollection: true,
        declarationImage: 'path/to/image1.jpg',
        wasteCollectionTax: {
            // Add IWasteCollectionTax properties if available
        },
        grossIncomeInvoiceId: 301
    },
    {
        id: 2,
        businessId: 102,
        business: {
            id: 102,
            name: 'Business B'
            // Add other required Business properties
        },
        branchOfficeId: 202,
        branchOffice: {
            id: 202,
            nickname: 'Branch 1'
            // Add other required BranchOffice properties
        },
        period: dayjs('2023-02'),
        amountBs: 12000,
        chargeWasteCollection: true,
        declarationImage: 'path/to/image2.jpg'
    },
    {
        id: 33,
        businessId: 103,
        business: {
            id: 103,
            name: 'Business C'
            // Add other required Business properties
        },
        branchOfficeId: 203,
        branchOffice: {
            id: 203,
            nickname: 'Headquarters'
            // Add other required BranchOffice properties
        },
        period: dayjs('2023-03'),
        amountBs: 122200,
        chargeWasteCollection: false,
        declarationImage: 'path/to/image3.jpg'
    },
    {
        id: 43,
        businessId: 103,
        business: {
            id: 103,
            name: 'Business C'
            // Add other required Business properties
        },
        branchOfficeId: 203,
        branchOffice: {
            id: 203,
            nickname: 'Headquarters'
            // Add other required BranchOffice properties
        },
        period: dayjs('2023-03'),
        amountBs: 122200,
        chargeWasteCollection: false,
        declarationImage: 'path/to/image3.jpg'
    }
]

const GrossIncomeInvoice: React.FC = () => {
    const [form] = Form.useForm()
    const { businessId } = useParams()
    const navigate = useNavigate()
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

    const [business, setBusiness] = useState<Business>()
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>([])
    const [currencyExchangeRates, setCurrencyExchangeRates] = useState<CurrencyExchangeRate | undefined>(undefined)

    const selectedOfficeId = Form.useWatch('branchOfficeId', form);
    const formPrice = Form.useWatch('form', form);

    useEffect(() => {
        loadBusiness()
        loadBranchOffices()
        loadGrossIncomes()

        form.setFieldValue('form', 1.6*40)
    }, [])

    const columns: ColumnsType<IGrossIncome> = [
        {
            title: 'Año',
            dataIndex: 'period',
            key: 'year',
            render: (value: dayjs.Dayjs) => value.year()
        },
        {
            title: 'Mes',
            dataIndex: 'period',
            key: 'month',
            render: (value: dayjs.Dayjs) => value.month() + 1
        },
        {
            title: 'Ingresos',
            dataIndex: 'amountBs',
            key: 'amountDeclared'
        },
        {
            title: 'Impuesto',
            dataIndex: 'tax',
            key: 'amountToPay',
            render: (text: any, record: IGrossIncome) => <Typography.Text>{record.amountBs * business?.economicActivity.alicuota} Bs.</Typography.Text>
        },
        {
            title: 'Min. Trib.',
            dataIndex: 'business',
            key: 'minimumAmount',
            render: (text: any, record: IGrossIncome) => <Typography.Text>{business?.economicActivity.minimumTax * util.getMMVExchangeRate(record.currencyExchangeRate)} Bs.</Typography.Text>
        },
        {
            title: 'Aseo',
            dataIndex: 'wasteCollectionTax',
            key: 'wasteCollectionTax',
            render: (text: string, record: any) => {
                return (<Typography>{util.getWasteCollectionTaxInBs(record)} Bs.</Typography>)
            }

        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'total',
            align: 'right',
            render: (text: any, record: IGrossIncome) => {
                let subtotal = util.getSubTotalFromGrossIncome(record, business)
                return (<Typography.Text>{subtotal} Bs.</Typography.Text>)
            }
        }
    ]

    async function loadBusiness() {
        const fetchedBusiness = await api.fetchBusinessById(Number(businessId));
        console.log('fetchedBusiness', fetchedBusiness)
        setBusiness(fetchedBusiness)
    }

    async function loadBranchOffices() {
        const fetchedBranchOffices = await api.fetchBranchOffices(Number(businessId));
        console.log('fetchedBranchOffices', fetchedBranchOffices)
        setBranchOffices(fetchedBranchOffices)
    }

    async function loadGrossIncomes() {
        const fetchedGrossIncomes = await grossIncomeApi.getAllGrossIncomesByBusinessId(Number(businessId));
        console.log('fetchedGrossIncomes', fetchedGrossIncomes)

        const grossIncomesWithoutCurrencyExchangeRate = fetchedGrossIncomes.filter(grossIncome => !grossIncome.currencyExchangeRate);

        if (grossIncomesWithoutCurrencyExchangeRate.length > 0) {
            message.error("Algunas declaraciones de ingresos no tienen tasas de cambio registradas")
            return false
        }

        const grossIncomesWithoutInvoice = fetchedGrossIncomes.filter(grossIncome => !grossIncome.grossIncomeInvoiceId)

        setGrossIncomes(grossIncomesWithoutInvoice)
    }

    async function loadCurrencyExchangeRates() {
        const fetchedCurrencyExchangeRates = await currencyExchangeRatesService.getAll();
        console.log('fetchedCurrencyExchangeRates', fetchedCurrencyExchangeRates)

        const lastCurrencyExchangeRate = fetchedCurrencyExchangeRates
            ?.sort((a, b) => dayjs(a.updatedAt).isBefore(dayjs(b.updatedAt)) ? 1 : -1)
            ?.[0]

        setCurrencyExchangeRates(lastCurrencyExchangeRate)
    }

    useEffect(() => {
        console.log('selectedRowKeys', selectedRowKeys)
    }, [selectedRowKeys])

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }

    const handleCreateInvoice = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Seleccione al menos un calculo de ingresos brutos')
            return false 
        } 


        const newInvoice: IGrossIncomeInvoiceCreate = {
            formPriceBs: formPrice,
            grossIncomesIds: selectedRowKeys.map(key => Number(key))
        }

        const registeredInvoice = await grossIncomesInvoiceService.create(newInvoice)

        console.log({registeredInvoice})

        if (selectedRowKeys.length === 1) { 
            message.success(
                `Calculo creado con el registro seleccionado`
            )
        } else {
            message.success(
                `Calculo creado con los ${selectedRowKeys.length} registros seleccionados`
            )
        }

        navigate(-1)
    }

    const onFinish = (values: any) => {
        console.log('Form values:', values);

        handleCreateInvoice();
    }

    let TOTAL = 0
    const selectedGrossIncomes = grossIncomes.filter(({id}) => selectedRowKeys.includes(id))
    selectedGrossIncomes.forEach( g => TOTAL += util.getSubTotalFromGrossIncome(g, business))
    TOTAL += formPrice

    return (
        <Form form={form} onFinish={handleCreateInvoice}>
            <Typography.Title level={2}>Nuevo Calculo de Ingresos Brutos</Typography.Title>
            <Typography.Title level={4}>Seleccione los calculos de ingresos brutos que desea facturar</Typography.Title>

            <Form.Item name="branchOfficeId" label="Sucursal" rules={[{ required: true }]}>
                <Select 
                    onChange={(value) => console.log('selectedOfficeId', value)} 
                    options={branchOffices?.map(branchOffice => ({
                        key: branchOffice.id,
                        value: branchOffice.id,
                        label: branchOffice.nickname
                    }))} 
                />
            </Form.Item>

            <Form.Item name="form" label="Coste del Formulario" rules={[{ required: true }]}>
                <InputNumber min={0} max={999999999} addonAfter="Bs"/>
            </Form.Item>

            <Form.Item name="selectedItems" initialValue={[]}>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={grossIncomes.filter(income => income.branchOfficeId === selectedOfficeId)}
                    rowKey='id'
                    pagination={false}
                />
                <Table showHeader={false} pagination={false} dataSource={[{ total: 1 }]}>
                    <Table.Column title="label" render={() => <Typography.Text>Formulario</Typography.Text>}/>
                    <Table.Column width={'15%'} align='right' title="value" render={() => <Typography.Text>{formPrice} Bs.</Typography.Text>}/>
                </Table>
                <Table showHeader={false} pagination={false} dataSource={[{ total: 1 }]}>
                    <Table.Column align='right' title="label" render={() => <Typography.Text>TOTAL</Typography.Text>}/>
                    <Table.Column align='right' width={'15%'} title="value" render={() => <Typography.Text>{TOTAL} Bs.</Typography.Text>}/>
                </Table>
            </Form.Item>
            <Form.Item>
                <Button
                    type='primary'
                    htmlType="submit"
                    style={{ marginTop: '20px' }}
                >
                    Registrar Calculo
                </Button>
            </Form.Item>
        </Form>
    )
}

export default GrossIncomeInvoice

