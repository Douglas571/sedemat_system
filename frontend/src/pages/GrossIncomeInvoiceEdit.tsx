import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Table, Button, message, Typography, Form, Select, InputNumber, Tooltip, Flex, Input, DatePicker, Card } from 'antd'
const { RangePicker } = DatePicker

import { ColumnsType } from 'antd/es/table'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // ES 2015
dayjs.extend(utc);

import { IGrossIncome, BranchOffice, Business, CurrencyExchangeRate, 
    IGrossIncomeInvoice, IGrossIncomeInvoiceCreate, IUser } from '../util/types' // Importing IGrossIncome from types
import * as grossIncomeApi from '../util/grossIncomeApi'
import * as api from '../util/api'
import currencyExchangeRatesService from '../services/CurrencyExchangeRatesService'
import grossIncomesInvoiceService from '../services/GrossIncomesInvoiceService'
import userService from '../services/UserService'

import { CurrencyHandler, formatBolivares, percentHandler } from '../util/currency'


const monthMapper = [
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

import * as util from '../util'
import useAuthentication from 'hooks/useAuthentication'
import { ReloadOutlined } from '@ant-design/icons'

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
    const [users, setUsers] = useState<IUser[]>()

    // create the select options 
    const checkByUserOptions = users?.map(user => ({
        label: user.username, 
        value: user.id
    }))

    const selectedCheckedByUserId = Form.useWatch('checkedByUserId', form);
    const selectedCheckedByUser = users?.find(user => user.id === selectedCheckedByUserId)
    

    const [grossIncomesToDisplay, setGrossIncomesToDisplay] = useState<IGrossIncome[]>([])

    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()

    const selectedOfficeId = Form.useWatch('branchOfficeId', form);
    const selectedOffice = branchOffices?.find(branchOffice => branchOffice.id === selectedOfficeId)
    const formPrice = Form.useWatch('form', form);
    const hasBranchOffices = branchOffices?.length > 0

    const isEditing = grossIncomeInvoiceId !== undefined

    const { userAuth } = useAuthentication()

    if (!Number(businessId)) {
        return <div>Ocurrió un error, llame al desarrollador :)</div>
    }

    const selectedGrossIncomes = grossIncomes.filter(({id}) => selectedRowKeys.includes(id))
    let TOTAL = selectedGrossIncomes.reduce((total, grossIncome) => CurrencyHandler(total).add(grossIncome.totalTaxInBs).value, 0)
    TOTAL = CurrencyHandler(TOTAL).add(formPrice).value

    const loadGrossIncomeInvoice = async () => {
        const fetchedGrossIncomeInvoice = await grossIncomesInvoiceService.getById(Number(grossIncomeInvoiceId))
        setGrossIncomeInvoice(fetchedGrossIncomeInvoice)

        console.log({fetchedGrossIncomeInvoice})
    }

    const loadData = async () => {
        await loadLastCurrencyExchangeRate()
        await loadBusiness()
        await loadBranchOffices()

        if (isEditing) {
            await loadGrossIncomeInvoice()
        }

        await loadGrossIncomes()

        await loadUsers()
    }

    // TODO: Refactor this as a map, that calculate every data needed to display
    // in the table. Then pass the array of objects to the table.
    const columns: ColumnsType<IGrossIncome> = [
        {
            title: 'Periodo',
            dataIndex: 'period',
            key: 'year',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            render: (period: any) => {
                return period.year() + ' - ' + monthMapper[period.month()];
            },
            sorter: (a: IGrossIncome, b: IGrossIncome) => dayjs(a.period).isBefore(dayjs(b.period)) ? -1 : 1,
            defaultSortOrder: 'descend',
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
                const alicuotaTaxPercent = record.alicuotaTaxPercent

                // if (!alicuotaTaxPercent || amountBs === 0) {
                //     return <Typography.Text>{CurrencyHandler(0).format()}</Typography.Text>
                // } 

                return (<Tooltip title={
                    `${formatBolivares(amountBs)} x ${percentHandler(alicuotaTaxPercent).multiply(100).format()}`
                }>
                    <Typography.Text>{CurrencyHandler(record.taxInBs).format()}</Typography.Text>
                </Tooltip>)
            }
        },
        {
            title: 'Min. Trib.',
            dataIndex: 'business',
            key: 'minimumAmount',

            render: (text: any, record: IGrossIncome) => 
            {
                
                return (<Tooltip title={
                        util.getMinTaxMMVStringOperationToolTipText({
                            minTaxMMV: record.alicuotaMinTaxMMVBCV,
                            TCMMVBCV: record.TCMMVBCV
                        })
                    }>
                        <Typography.Text>
                            {
                                CurrencyHandler(record.minTaxInBs).format()
                            }
                        </Typography.Text>
                    </Tooltip>)
            }
        },
        {
            title: 'Aseo',
            dataIndex: 'wasteCollectionTax',
            key: 'wasteCollectionTax',
            render: (text: string, record: IGrossIncome) => {

                if (!record.chargeWasteCollection) {
                    return '--'
                }
                    
                
                return (
                <Tooltip title={util.getMinTaxMMVStringOperationToolTipText({
                    minTaxMMV: util.getWasteCollectionTaxInMMV(record.branchOffice.dimensions),
                    TCMMVBCV: record.TCMMVBCV
                })}>
                    <Typography>{
                    CurrencyHandler(record.wasteCollectionTaxInBs)
                        .format()
                    }</Typography>
                </Tooltip>)
            }
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'total',
            align: 'right',
            render: (text: any, record: IGrossIncome) => {
                let subtotal = record.totalTaxInBs
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

    async function loadUsers() {
        let fetchedUsers = await userService.findAll();
        setUsers(fetchedUsers)
    }
    
    async function loadGrossIncomes() {
        const fetchedGrossIncomes = await grossIncomeApi.getAllGrossIncomesByBusinessId(Number(businessId));

        setGrossIncomes(fetchedGrossIncomes)
    }

    async function loadLastCurrencyExchangeRate() {
        const lastCurrencyExchangeRate = await currencyExchangeRatesService.getLastOne()
        
        setLastCurrencyExchangeRate(lastCurrencyExchangeRate)
    }

    

    async function handleUpdateCheckedByUserPersonFullName() {
        let fullName = ''
        let person = selectedCheckedByUser?.person

        if (person) {
            fullName = `${person.firstName} ${person.lastName}`
        } 

        form.setFieldsValue({
            checkedByUserPersonFullName: fullName
        })
    }

    async function handleUpdateCreatedByUserPersonFullName() {
        let fullName = ''
        let person = userAuth.user?.person

        if (person) {
            fullName = `${person.firstName} ${person.lastName}`
        }

        form.setFieldsValue({
            createdByUserPersonFullName: fullName
        })
    }

    async function handleUpdateTCMMVBCV() {
        if (lastCurrencyExchangeRate) {
            form.setFieldsValue({
                TCMMVBCV: util.getMMVExchangeRate(lastCurrencyExchangeRate),
                TCMMVBCVValueDate: dayjs(lastCurrencyExchangeRate.createdAt).utc()
            })
        }
    }

    async function handleBusinessDataUpdate() {
        if (business) {
            form.setFieldsValue({
                businessName: business.businessName,
                businessDNI: business.dni
            })
        }

        if (selectedOffice) {
            form.setFieldsValue({
                branchOfficeName: selectedOffice.nickname,
                branchOfficeAddress: selectedOffice.address,
                branchOfficeDimensions: selectedOffice.dimensions,
                branchOfficeType: selectedOffice.type
            })
        }
    }

    async function loadCurrencyExchangeRates() {
        const fetchedCurrencyExchangeRates = await currencyExchangeRatesService.getAll();
        

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


    const onFinish = async (values: any) => {
        console.log('Form values:', values);

        if (!business) {
            if (!selectedBranchOffice) {
                message.warning('Por favor, seleccione una sucursal y una declaración de ingresos brutos')
                return 
            }

            message.warning('Por favor, seleccione una declaración de ingresos brutos')
            return
        }

        try {
            if (selectedRowKeys.length === 0) {
                message.warning('Seleccione al menos un calculo de ingresos brutos')
                return false 
            }

            let newInvoice: IGrossIncomeInvoiceCreate = {
                ...grossIncomeInvoice,
                ...values,

                // assuming the start of the week is on monday
                TCMMVBCVValidSince: dayjs(values.TCMMVBCVValidDateRange).startOf('week').format('YYYY-MM-DD'),
                TCMMVBCVValidUntil: dayjs(values.TCMMVBCVValidDateRange).endOf('week').format('YYYY-MM-DD'),
                
                businessId: businessId,
                formPriceBs: formPrice,
                grossIncomesIds: selectedRowKeys.map(key => Number(key)),

                totalBs: TOTAL,
                TCMMVBCV: values.TCMMVBCV,
            }

            // if (!isEditing) {

            //     // asigne the business data only when creating the invoice 
            //     // TODO: Add controls to change this information after creating the invoice 
            //     newInvoice = Object.assign(newInvoice)

            // }

            let registeredInvoice

            if (isEditing) {
                newInvoice.removeGrossIncomesIds = grossIncomeInvoice.grossIncomes.map( g => g.id).filter( id => !selectedRowKeys.includes(id))
                newInvoice.grossIncomesIds = selectedRowKeys.filter( id => !grossIncomeInvoice.grossIncomes.map( g => g.id).includes(id) )

                console.log('newInvoice', newInvoice)
                registeredInvoice = await grossIncomesInvoiceService.update(newInvoice, userAuth.token)
            } else {
                newInvoice.grossIncomesIds = selectedRowKeys.map(key => Number(key))
                registeredInvoice = await grossIncomesInvoiceService.create(newInvoice, userAuth.token)
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
                message.error(error.message)
            } else {
                message.error(`Error al crear la factura`)
            }
        }
    }

    useEffect(() => {

        // filter by office 
        let toDisplay: IGrossIncome = []

        if (hasBranchOffices) {
            toDisplay = grossIncomes.filter(income => income.branchOfficeId === selectedOfficeId)
        } else {
            toDisplay = grossIncomes
        }

        console.log('toDisplay', toDisplay)



    
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
            form.setFieldsValue({
                ...grossIncomeInvoice,
                TCMMVBCV: grossIncomeInvoice.TCMMVBCV,

                TCMMVBCVValidDateRange: dayjs(grossIncomeInvoice.TCMMVBCVValidSince).utc()
            })
        } else {
            if (branchOffices?.length > 0) {
                const branchOfficeId = branchOffices[0].id;
                form.setFieldValue('branchOfficeId', branchOfficeId);
            }

            form.setFieldsValue({
                TCMMVBCVValidDateRange: dayjs().utc(),
                form: CurrencyHandler(1.6).multiply(40).value
            })

            handleBusinessDataUpdate()
        }

    }, [grossIncomeInvoice, branchOffices])

    useEffect(() => {
        handleUpdateTCMMVBCV()
    }, [lastCurrencyExchangeRate])
    

    return (
        <Card>
            <Form form={form} onFinish={onFinish}>
                <Typography.Title level={2}>{isEditing ? 'Editar Factura' : 'Nuevo Calculo de Ingresos Brutos'}</Typography.Title>

                <Flex align='center' justify='space-between'>
                    <Typography.Title level={4}>Información de la Empresa</Typography.Title>
                    <Button onClick={() => handleBusinessDataUpdate()}>
                        <ReloadOutlined />
                        Actualizar
                    </Button>
                </Flex>
                <Flex gap={16} wrap>
                    <Form.Item name="businessName" label="Razón Social" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="businessDNI" label="RIF" rules={[{ required: true }]}>  
                        <Input />
                    </Form.Item>

                    {
                        hasBranchOffices && (
                            <Flex gap={16} wrap>
                                <Form.Item 
                                    name="branchOfficeName" label="Nombre de la sucursal" rules={[{ required: true }]}>  
                                    <Input />
                                </Form.Item>
                                <Form.Item name="branchOfficeAddress" label="Dirección de la sucursal" rules={[{ required: true }]}>  
                                    <Input />
                                </Form.Item>
                                <Form.Item name="branchOfficeDimensions" label="Dimensiones de la sucursal" rules={[{ required: true }]}>  
                                    <Input />
                                </Form.Item>
                                <Form.Item name="branchOfficeType" label="Tipo de sucursal" rules={[{ required: true }]}>  
                                    <Input />
                                </Form.Item>
                            </Flex>
                        )
                    }
                    
                </Flex>

                <Typography.Title level={4}>Información de la Factura</Typography.Title>
                <Flex wrap gap={16}>

                    {
                        hasBranchOffices && (
                            <Form.Item 
                                style={{ minWidth: 300 }}
                                name="branchOfficeId" label="Sucursal" rules={[{ required: true }]}>
                                <Select
                                    options={branchOffices?.map(branchOffice => ({
                                        key: branchOffice.id,
                                        value: branchOffice.id,
                                        label: branchOffice.nickname
                                    }))} 

                                    disabled={isEditing}
                                />
                            </Form.Item>
                        )
                    }

                    <Form.Item name="form" label="Coste del Formulario" rules={[{ required: true }]}>
                        <InputNumber min={0} max={999999999} addonAfter="Bs" decimalSeparator=',' precision={2} step={0.01}/>
                    
                    </Form.Item>
                </Flex>

                <Flex wrap gap={16}>
                    <Form.Item name="TCMMVBCV" label="TC-MMVBCV" rules={[{ required: true }]}>
                        <InputNumber min={0} addonAfter="Bs" decimalSeparator=',' precision={2} step={0.01}/>
                    </Form.Item>

                    <Form.Item name="TCMMVBCVValidDateRange" label="Rango de Validez" rules={[{ required: true }]}>
                        <DatePicker picker="week"/>
                    </Form.Item>

                    <Button onClick={() => handleUpdateTCMMVBCV()}>
                        <ReloadOutlined />
                        Actualizar
                    </Button>
                </Flex>

                <Flex wrap gap={16} vertical>
                    <Flex gap={16}>
                        <Form.Item name="createdByUserPersonFullName" label="Creado por" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Button onClick={() => handleUpdateCreatedByUserPersonFullName()}>
                            <ReloadOutlined /> 
                            Actualizar
                        </Button>
                    </Flex>

                    <Flex gap={16} wrap>
                        <Form.Item name="checkedByUserPersonFullName" label="Revisado por" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="checkedByUserId" 
                            label="Usuario" 
                            rules={[{ required: true }]}

                            style={{ width: 350}}
                        >
                            <Select
                                options={checkByUserOptions}
                            />
                        </Form.Item>
                        <Button onClick={() => handleUpdateCheckedByUserPersonFullName()}>
                            <ReloadOutlined /> 
                            Actualizar
                        </Button>
                    </Flex>
                </Flex>

                <Typography.Title level={4}>Seleccione los calculos de ingresos brutos que desea facturar</Typography.Title>
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
                        {isEditing ? 'Actualizar' : 'Guardar'} factura
                    </Button>
                </Form.Item>
            </Form>
            
        </Card>
        
    )
}

export default GrossIncomeInvoice

