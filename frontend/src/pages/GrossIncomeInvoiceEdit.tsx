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
import currency from 'currency.js'

const monthsInSpanish = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];


const CurrencyHandler = (value: number | string) => currency(value, 
    { 
        pattern: '#', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
)

const formatBolivares = (value: number | string) => currency(value, 
    { 
        symbol: 'Bs.', 
        pattern: '# !', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
).format()

import * as util from '../util'

const GrossIncomeInvoice: React.FC = () => {
    const [form] = Form.useForm()
    const { businessId, grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

    const [business, setBusiness] = useState<Business>()
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>([])
    const [currencyExchangeRates, setCurrencyExchangeRates] = useState<CurrencyExchangeRate | undefined>(undefined)
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice | undefined>(undefined)

    const selectedOfficeId = Form.useWatch('branchOfficeId', form);
    const formPrice = Form.useWatch('form', form);

    const isEditing = grossIncomeInvoiceId !== undefined

    if (!Number(businessId)) {
        return <div>Ocurrió un error, llame al desarrollador :)</div>
    }

    const selectedGrossIncomes = grossIncomes.filter(({id}) => selectedRowKeys.includes(id))
    let TOTAL = util.calculateTotalGrossIncomeInvoice(selectedGrossIncomes, business, formPrice)

    const loadGrossIncomeInvoice = async () => {
        const fetchedGrossIncomeInvoice = await grossIncomesInvoiceService.getById(Number(grossIncomeInvoiceId))
        setGrossIncomeInvoice(fetchedGrossIncomeInvoice)
    }

    const loadData = async () => {
        await loadBusiness()
        await loadBranchOffices()

        if (isEditing) {
            await loadGrossIncomeInvoice()
        }

        await loadGrossIncomes()
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {        
        if (grossIncomeInvoice) {
            const firstGrossIncome = grossIncomeInvoice.grossIncomes[0];
            if (firstGrossIncome) {
                const branchOfficeId = firstGrossIncome.branchOfficeId;
                form.setFieldValue('branchOfficeId', branchOfficeId);
            }

            form.setFieldValue('form', CurrencyHandler(grossIncomeInvoice.formPriceBs).value)
        } else {
            if (branchOffices) {
                const branchOfficeId = branchOffices[0].id;
                form.setFieldValue('branchOfficeId', branchOfficeId);
            }

            form.setFieldValue('form', CurrencyHandler(1.6).multiply(40).value)
        }


    }, [grossIncomeInvoice, branchOffices])

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
            render: (value: dayjs.Dayjs) => monthsInSpanish[value.month()]
        },
        {
            title: 'Ingresos',
            dataIndex: 'amountBs',
            key: 'amountDeclared',
            render: (text: any, record: IGrossIncome) => <Typography.Text>{CurrencyHandler(record.amountBs).format()}</Typography.Text>
        },
        {
            title: 'Impuesto',
            dataIndex: 'tax',
            key: 'amountToPay',
            render: (text: any, record: IGrossIncome) => {
                const {amountBs} = record
                const alicuota = business?.economicActivity.alicuota

                if (!alicuota || amountBs === 0) {
                    return <Typography.Text>{CurrencyHandler(0).format()}</Typography.Text>
                } 

                return (<Typography.Text>{CurrencyHandler(amountBs).multiply(alicuota).format()}</Typography.Text>)
            }
        },
        {
            title: 'Min. Trib.',
            dataIndex: 'business',
            key: 'minimumAmount',
            render: (text: any, record: IGrossIncome) => <Typography.Text>{
                CurrencyHandler(business?.economicActivity.minimumTax)
                        .multiply(util.getMMVExchangeRate(record.currencyExchangeRate))
                        .format()
                }</Typography.Text>
        },
        {
            title: 'Aseo',
            dataIndex: 'wasteCollectionTax',
            key: 'wasteCollectionTax',
            render: (text: string, record: any) => {
                return (<Typography>{CurrencyHandler(util.getWasteCollectionTaxInBs(record)).format()}</Typography>)
            }

        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'total',
            align: 'right',
            render: (text: any, record: IGrossIncome) => {
                let subtotal = util.getSubTotalFromGrossIncome(record, business)
                return (<Typography.Text>{formatBolivares(subtotal)}</Typography.Text>)
            }
        }
    ]

    async function loadBusiness() {
        const fetchedBusiness = await api.fetchBusinessById(Number(businessId));
        setBusiness(fetchedBusiness)
    }

    async function loadBranchOffices() {
        const fetchedBranchOffices = await api.fetchBranchOffices(Number(businessId));
        setBranchOffices(fetchedBranchOffices)
    }

    async function loadGrossIncomes() {
        const fetchedGrossIncomes = await grossIncomeApi.getAllGrossIncomesByBusinessId(Number(businessId));


        const grossIncomesWithoutCurrencyExchangeRate = fetchedGrossIncomes
            .filter(grossIncome => !grossIncome.currencyExchangeRate)

        if (grossIncomesWithoutCurrencyExchangeRate.length > 0) {
            message.error("Algunas declaraciones de ingresos no tienen tasas de cambio registradas")
            return false
        }

        setGrossIncomes(fetchedGrossIncomes)

        // if (isEditing) {
        //     //const grossIncomesWithInvoice = fetchedGrossIncomes.filter(grossIncome => grossIncome.grossIncomeInvoiceId == Number(grossIncomeInvoiceId))
        //     setGrossIncomes(fetchedGrossIncomes)

        //     const selectedIds = grossIncomeInvoice.grossIncomes.map( g => g.id )
            
        //     setSelectedRowKeys(fetchedGrossIncomes.map(g => g.id).filter( id => selectedIds.includes(id)))
        // } else {
        //     const grossIncomesWithoutInvoice = fetchedGrossIncomes.filter(grossIncome => !grossIncome.grossIncomeInvoiceId)
        //     setGrossIncomes(grossIncomesWithoutInvoice)
        // }
    }

    const [grossIncomesToDisplay, setGrossIncomesToDisplay] = useState<IGrossIncome[]>([])
    useEffect(() => {

        // filter by office 
        let toDisplay = grossIncomes.filter(income => income.branchOfficeId === selectedOfficeId)
    
        // if is not editing, hide those who have grossIncomeInvoiceId
        if (!isEditing) {
            toDisplay = toDisplay.filter( g => g.grossIncomeInvoiceId === null)
        } else {
            if (grossIncomeInvoice) {
                // gross incomes where the grossIncomeInvoiceId is null or equal to grossIncomeInvoiceId
                toDisplay = toDisplay.filter(g => g.grossIncomeInvoiceId === null || g.grossIncomeInvoiceId === Number(grossIncomeInvoiceId))
                const selectedIds = grossIncomeInvoice.grossIncomes.map( g => g.id )
                setSelectedRowKeys([...selectedIds])
            }
        }

        setGrossIncomesToDisplay([...toDisplay])


    }, [grossIncomes, selectedOfficeId])

    async function loadCurrencyExchangeRates() {
        const fetchedCurrencyExchangeRates = await currencyExchangeRatesService.getAll();
        console.log('fetchedCurrencyExchangeRates', fetchedCurrencyExchangeRates)

        const lastCurrencyExchangeRate = fetchedCurrencyExchangeRates
            ?.sort((a, b) => dayjs(a.updatedAt).isBefore(dayjs(b.updatedAt)) ? 1 : -1)
            ?.[0]

        setCurrencyExchangeRates(lastCurrencyExchangeRate)
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }
    const handleCreateInvoice = async () => {
        try {
            if (selectedRowKeys.length === 0) {
                message.warning('Seleccione al menos un calculo de ingresos brutos')
                return false 
            }

            const newInvoice: IGrossIncomeInvoiceCreate = {
                id: Number(grossIncomeInvoiceId),
                businessId: businessId,
                formPriceBs: formPrice,
                grossIncomesIds: selectedRowKeys.map(key => Number(key)),
                totalBs: TOTAL
            }

            let registeredInvoice

            if (isEditing) {
                newInvoice.removeGrossIncomesIds = grossIncomeInvoice.grossIncomes.map( g => g.id).filter( id => !selectedRowKeys.includes(id))
                newInvoice.grossIncomesIds = selectedRowKeys.filter( id => !grossIncomeInvoice.grossIncomes.map( g => g.id).includes(id) )

                console.log('newInvoice', newInvoice)
                registeredInvoice = await grossIncomesInvoiceService.update(newInvoice)
            } else {
                newInvoice.grossIncomesIds = selectedRowKeys.map(key => Number(key))
                registeredInvoice = await grossIncomesInvoiceService.create(newInvoice)
                if (selectedRowKeys.length === 1) { 
                    message.success(
                        `Calculo creado con el registro seleccionado`
                    )
                } else {
                    message.success(
                        `Calculo creado con los ${selectedRowKeys.length} registros seleccionados`
                    )
                }
            }

            console.log({registeredInvoice})
            navigate(-1)
        } catch (error) {
            console.log({error})
            if (isEditing) {
                message.error(`Error al editar la factura`)
            } else {
                message.error(`Error al crear la factura`)
            }
        }
    }

    const onFinish = (values: any) => {
        console.log('Form values:', values);

        handleCreateInvoice();
    }

    return (
        <Form form={form} onFinish={handleCreateInvoice}>
            <Typography.Title level={2}>{isEditing ? 'Editar Calculo de Ingresos Brutos' : 'Nuevo Calculo de Ingresos Brutos'}</Typography.Title>
            <Typography.Title level={4}>Seleccione los calculos de ingresos brutos que desea facturar</Typography.Title>

            <Form.Item name="branchOfficeId" label="Sucursal" rules={[{ required: true }]}>
                <Select 
                    onChange={(value) => console.log('selectedOfficeId', value)} 
                    options={branchOffices?.map(branchOffice => ({
                        key: branchOffice.id,
                        value: branchOffice.id,
                        label: branchOffice.nickname
                    }))} 

                    disabled={isEditing}
                />
            </Form.Item>

            <Form.Item name="form" label="Coste del Formulario" rules={[{ required: true }]}>
                <InputNumber min={0} max={999999999} addonAfter="Bs" decimalSeparator=',' precision={2} step={0.01}/>
            
            </Form.Item>

            <Form.Item name="selectedItems" initialValue={[]}>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={grossIncomesToDisplay}
                    rowKey='id'
                    pagination={false}
                />
                <Table showHeader={false} pagination={false} dataSource={[{ total: 1 }]}>
                    <Table.Column title="label" render={() => <Typography.Text>Formulario</Typography.Text>}/>
                    <Table.Column width={'15%'} align='right' title="value" render={() => <Typography.Text>{formatBolivares(formPrice)}</Typography.Text>}/>
                </Table>
                <Table showHeader={false} pagination={false} dataSource={[{ total: 1 }]}>
                    <Table.Column align='right' title="label" render={() => <Typography.Text>TOTAL</Typography.Text>}/>
                    <Table.Column align='right' width={'15%'} title="value" render={() => <Typography.Text>{formatBolivares(TOTAL)}</Typography.Text>}/>
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

