import React, { useEffect, useState } from 'react'

import { FormProps, Typography } from 'antd'
import { Form, Input, Button, message, Select, TimePicker, DatePicker, Table } from 'antd'
import type { DatePickerProps } from 'antd'

import type { EconomicActivity, Business, BranchOffice, License } from '../util/api';

import { useParams } from 'react-router-dom';

import * as api from '../util/api'
import CurrencyExchangeRatesService from '../services/CurrencyExchangeRatesService'
import { Payment, Person, CurrencyExchangeRate } from '../util/types'

interface IInvoiceItemType {
    id: number,
    name: string,
    
    defaultAmountMMV: number
}

interface IPaymentAllocation {
    id: number,
    payment: Payment,
    amountBs: number
}

interface IRole {
    id: number,
    name: string
}

interface IUser {
    id: number,
    email: string,
    role: IRole,
    person: Person,
}

interface IInvoiceItem {
    id: number,
    invoiceItemTypeId: number,
    invoiceItemType: IInvoiceItemType,
    amountMMV: number
}

export default function BranchOfficeLicenseNew(): JSX.Element {
    const [messageApi, contextHolder] = message.useMessage()
    const [form] = Form.useForm()
    let { businessId, licenseId, branchOfficeId } = useParams();

    const isEdit = licenseId !== undefined

    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);
    const [business, setBusiness] = useState<Business>();

    const [invoiceItemTypes, setInvoiceItemTypes] = useState<Array<IInvoiceItemType>>([])
    const [paymentAllocations, setPaymentAllocations] = useState<Array<IPaymentAllocation>>([])
    const [users, setUsers] = useState<Array<IUser>>([])
    const [currencyExchangeRates, setCurrencyExchangeRates] = useState<CurrencyExchangeRate[]>([]);

    const [invoiceItems, setInvoiceItems] = useState<Array<IInvoiceItem>>([])

    useEffect(() => {
        loadData()

        // loadUsers()
        loadUsers()

        loadInvoiceItemTypes()

        loadLastCurrencyExchangeRate()

        loadBusinessData()
    }, [])

    useEffect(() => {
        fillInvoiceItems()
    }, [invoiceItemTypes])

    function fillInvoiceItems() {
        // get 1 invoiceItem with invoiceItemType.id = 1
        // get 1 invoiceItem with invoiceItemType.id = 2
        // get 1 invoiceItem with invoiceItemType.id = 3
        // get 1 invoiceItem with invoiceItemType.id = 4

        setInvoiceItems([
            {
                id: 1,
                key: 1,
                invoiceItemTypeId: invoiceItemTypes.find(iit => iit.id === 1)?.id ?? 0,
                invoiceItemType: invoiceItemTypes.find(iit => iit.id === 1),
                amountMMV: invoiceItemTypes.find(iit => iit.id === 1)?.defaultAmountMMV ?? 0
            },
            {
                id: 2,
                key: 2,
                invoiceItemTypeId: invoiceItemTypes.find(iit => iit.id === 2)?.id ?? 0,
                invoiceItemType: invoiceItemTypes.find(iit => iit.id === 2),
                amountMMV: invoiceItemTypes.find(iit => iit.id === 2)?.defaultAmountMMV ?? 0
            },
            {
                id: 3,
                key: 3,
                invoiceItemTypeId: invoiceItemTypes.find(iit => iit.id === 3)?.id ?? 0,
                invoiceItemType: invoiceItemTypes.find(iit => iit.id === 3),
                amountMMV: invoiceItemTypes.find(iit => iit.id === 3)?.defaultAmountMMV ?? 0
            },
            {
                id: 4,
                key: 4,
                invoiceItemTypeId: invoiceItemTypes.find(iit => iit.id === 4)?.id ?? 0,
                invoiceItemType: invoiceItemTypes.find(iit => iit.id === 4),
                amountMMV: invoiceItemTypes.find(iit => iit.id === 4)?.defaultAmountMMV ?? 0
            }
        ])
    }

    async function loadData() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

            // Fetch the business
            const business = await api.fetchBusinessById(Number(businessId));
            console.log({business})
            setBusiness(business);


            form.setFieldsValue({
                taxpayer: business.businessName
            })

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async function loadUsers() {
        // define dummy users for now
        setUsers([
            {
                id: 1,
                email: 'admin@gmail.com',
                role: {
                    id: 4,
                    name: 'Recaudador'
                },
                person: {
                    firstName: 'Jose',
                    lastName: 'Herrera',
                    dni: '12345678',
                    whatsapp: '12345678',
                    phone: '12345678',
                    email: 'cheo@gmail.com',
                }
            }, {
                id: 2,
                email: 'admin@gmail.com',
                role: {
                    id: 5,
                    name: 'Coordinador'
                },
                person: {
                    firstName: 'Hipolita',
                    lastName: 'Gonzales',
                    dni: '12345678',
                    whatsapp: '12345678',
                    phone: '12345678',
                    email: 'pola@gmail.com',
                }
            }
        ])
    }

    async function loadInvoiceItemTypes() {
        setInvoiceItemTypes([
            {
                id: 1,
                name: 'Inscripción de Actividad Económica',
                defaultAmountMMV: 15
            },
            {
                id: 2,
                name: 'Certificación y Solvencia',
                defaultAmountMMV: 3,
            },
            {
                id: 3,
                name: 'Publicidad y Propaganda',
                defaultAmountMMV: 0.1,
            },
            {
                id: 4,
                name: 'Formulario',
                defaultAmountMMV: 1.5,
            }
        ])
    }

    async function loadLastCurrencyExchangeRate() {
        // const lastCurrencyExchangeRate = await api.getLastCurrencyExchangeRate()
        // console.log({lastCurrencyExchangeRate})
        try {
            const data = await CurrencyExchangeRatesService.getAll();
            setCurrencyExchangeRates(data);
        } catch (error) {
            message.error('Error al consultar tasas de cambio');
        }
    }

    async function loadBusinessData() {
        const business = await api.fetchBusinessById(Number(businessId));
        console.log({business})
        setBusiness(business);
    }

    const establishments = [
        {
            value: 'Calle Bolívar',
            label: 'Calle Bolívar',
        },
        {
            value: 'Algarbe',
            label: 'Algarbe',
        },
    ]

    const handleIssueDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        console.log({ date })

        // Assuming you want to add one year to the date
        const expirationDate = date?.clone().add(1, 'year')
        
        form.setFieldsValue({
            expirationDate
        })
    }


    function cleanForm() {
        form.setFieldsValue({
            economicActivity: '',
            issuedDate: '',
            expirationDate: ''
        })
    }
    const registerlicense: FormProps<FiledType>['onFinish'] = async (values) => {
        // get businessId
        // get branchOfficeId
        // create a license object

        return

        try {
            const economicActivityId = economicActivities.find( e => e.title === values.economicActivity )?.id
            console.log({economicActivityId})

            if (!branchOfficeId || !economicActivityId){
                return null
            }

            let newLicense = {
                branchOfficeId: Number(branchOfficeId),
                economicActivityId,
                issuedDate: values.issuedDate,
                expirationDate: values.expirationDate,

            }
            console.log({newLicense})
            let registeredLicense = await api.registerLicense(newLicense)
            console.log({registeredLicense})

            messageApi.open({
                type: 'success',
                content: "Licencia Otorgada Exitosamente.",
            });

            cleanForm()


        } catch (error) {
            console.error({error})

            messageApi.open({
                type: 'error',
                content: "Hubo un error.",
            });
        }
    }

    interface FormFields {
        taxpayer: string,
        branchOffice: string,
        economicActivity: string,
        issuedDate: Date,
        expirationDate: Date
    }

    const invoiceItemColumns = [
        {
            title: 'Concepto',
            dataIndex: 'invoiceItemType',
            key: 'invoiceItemType',
            render: (invoiceItemType: IInvoiceItemType) => invoiceItemType.name
        },
        {
            title: 'MMV',
            dataIndex: 'amountMMV',
            key: 'amountMMV',
        },
        {
            title: 'Bs',
            dataIndex: 'amountMMV',
            key: 'amountBs',
            render: (amountMMV: number) => amountMMV * 40 // * currencyExchangeRates[0].rate
        }
    ]

    const paymentAllocationColumns = [
        {
            title: 'Referencia',
            dataIndex: 'payment',
            key: 1,
            render: (payment: Payment) => payment.reference
        },
        {
            title: 'Monto',
            dataIndex: 'payment',
            key: 3,
            render: (payment: Payment) => payment.amount
        },
        {
            title: 'Destinado',
            dataIndex: 'amountBs',
            key: 2,
            render: (amountBs: number) => amountBs
        }
    ]

    return (
        <div>
            {contextHolder}

            <Typography.Title level={2}>
                {isEdit ? 'Editar' : 'Nueva'} Licencia
            </Typography.Title>

            <Form 
                form={form}
                onFinish={registerlicense}
            >
                <Form.Item<FormFields> 
                    label='Contribuyente: ' 
                    name='taxpayer'
                >
                    <Input
                        disabled
                    >
                    </Input>
                </Form.Item>
                <Form.Item 
                    label='Sede o Establecimiento: '
                    name="branchOffice"
                >
                    <Select
                        disabled
                        defaultValue={establishments[0].value}
                        optionFilterProp='label'
                            // onChange={onChange}
                            // onSearch={onSearch}
                        options={establishments}
                    />
                </Form.Item>
                

                {/* Factura */}
                <Typography.Title level={4}>Conceptos</Typography.Title>
                <Table
                    dataSource={invoiceItems}
                    columns={invoiceItemColumns}
                    bordered
                    pagination={false}

                    summary={(invoiceItemsInTable) => {
                        const totalMMV = invoiceItemsInTable.reduce((acc, curr) => acc + curr.amountMMV, 0)
                        const totalBs = totalMMV * 40 // * currencyExchangeRates[0].rate
                        return (
                            <Table.Summary.Row style={{backgroundColor: '#fafafa'}}>
                                <Table.Summary.Cell index={0} colSpan={1} align='right'>TOTAL</Table.Summary.Cell>
                                <Table.Summary.Cell index={0} colSpan={1}>{totalMMV}</Table.Summary.Cell>
                                <Table.Summary.Cell index={0} colSpan={1}>{totalBs}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        )
                    }}
                />

                {/* Conceptos de Pago */}
                <Typography.Title level={4}>Pagos</Typography.Title>
                <Table
                    dataSource={paymentAllocations}
                    columns={paymentAllocationColumns}
                    bordered
                    pagination={false}
                />



                {/* Pagos */}



                {/* <Form.Item label='Horario'>
                    <TimePicker.RangePicker />
                </Form.Item> */}
                <Form.Item<FormFields>
                    rules={[
                        {required: true}
                    ]}
                    label='Fecha de Emisión'
                    name='issuedDate'
                >
                    <DatePicker onChange={handleIssueDateChange}/>
                </Form.Item>
                <Form.Item<FormFields>
                    rules={[
                        {required: true}
                    ]}
                    label='Fecha de Expiración' 
                    name='expirationDate'>
                    <DatePicker/>
                </Form.Item>

                <Form.Item>
                    <Button type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </div>
    )
}