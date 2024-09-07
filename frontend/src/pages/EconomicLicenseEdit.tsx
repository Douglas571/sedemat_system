import React, { useEffect, useState } from 'react'

import { Descriptions, Flex, FormProps, Typography } from 'antd'
import { Form, Input, InputNumber, Button, message, Select, TimePicker, DatePicker, Table, Modal } from 'antd'
import type { DatePickerProps } from 'antd'

import type { EconomicActivity, Business, BranchOffice, License } from '../util/api';

import { useParams } from 'react-router-dom';

import * as api from '../util/api'
import * as paymentsApi from '../util/paymentsApi'
import * as invoiceItemTypesApi from '../util/invoiceItemTypesApi'

import CurrencyExchangeRatesService from '../services/CurrencyExchangeRatesService'
import { Payment, Person, CurrencyExchangeRate } from '../util/types'

interface IInvoiceItemType {
    id: number,
    name: string,
    
    defaultAmountMMV: number
}

interface IPaymentAllocation {
    id?: number,
    paymentId: number,
    payment?: Payment,
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
    const [payments, setPayments] = useState<Array<Payment>>([])
    const [paymentAllocations, setPaymentAllocations] = useState<Array<IPaymentAllocation>>([])
    const [users, setUsers] = useState<Array<IUser>>([])
    const [currencyExchangeRates, setCurrencyExchangeRates] = useState<CurrencyExchangeRate[]>([]);

    const [showActivateButton, setShowActivateButton] = useState<boolean>(true)

    const [invoiceItems, setInvoiceItems] = useState<Array<IInvoiceItem>>([])

    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        loadData()

        // loadUsers()
        loadUsers()

        loadInvoiceItemTypes()

        loadLastCurrencyExchangeRate()

        loadBusinessData()

        loadPayments()

    }, [])

    useEffect(() => {
        fillInvoiceItems()
    }, [invoiceItemTypes])

    function fillInvoiceItems() {

        /**
         *  formulario = 301090101
         *  solvencia = 301034900
         *  publicidad = 306010102
         *  inscripcion = 306010103
         */

        const invoiceItemTypeCodes = {
            inscription: '306010103',
            solvency: '301034900',
            advertising: '306010102',
            form: '301090101',
        };
        
        // get the proper invoiceItemType for a license invoice 
        // in this particular case    
            // get 1 invoiceItem with invoiceItemType.id = 1
            // get 1 invoiceItem with invoiceItemType.id = 2
            // get 1 invoiceItem with invoiceItemType.id = 3
            // get 1 invoiceItem with invoiceItemType.id = 4


        const newInvoiceItems = Object.entries(invoiceItemTypeCodes).map(([key, code], index) => {
            const invoiceItemType = invoiceItemTypes.find(iit => iit.code === code);
            return {
                id: index + 1,
                key: index + 1,
                invoiceItemTypeId: invoiceItemType?.id ?? 0,
                invoiceItemType: invoiceItemType,
                amountMMV: invoiceItemType?.defaultAmountMMV ?? 0
            };
        });

        setInvoiceItems(newInvoiceItems);
    }

    async function loadPayments() {

        // for now, i will fetch all payments
        // TODO: Filter payments by business, owners, administrators and accountants of the business 
        const fetchedPayments = await paymentsApi.findAll()
        console.log({fetchedPayments})
        // fill payments with dummy data with payment interface
        setPayments([...fetchedPayments])
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
        const fetchedInvoiceItemTypes = await invoiceItemTypesApi.findAll()
        console.log({fetchedInvoiceItemTypes})
        setInvoiceItemTypes([...fetchedInvoiceItemTypes])

        // setInvoiceItemTypes([
        //     {
        //         id: 1,
        //         name: 'Inscripción de Actividad Económica',
        //         defaultAmountMMV: 15
        //     },
        //     {
        //         id: 2,
        //         name: 'Certificación y Solvencia',
        //         defaultAmountMMV: 3,
        //     },
        //     {
        //         id: 3,
        //         name: 'Publicidad y Propaganda',
        //         defaultAmountMMV: 0.1,
        //     },
        //     {
        //         id: 4,
        //         name: 'Formulario',
        //         defaultAmountMMV: 1.5,
        //     }
        // ])
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

    const invoiceItemColumns = [
        {
            title: 'Concepto',
            dataIndex: 'invoiceItemType',
            key: 'invoiceItemType',
            render: (invoiceItemType: IInvoiceItemType) => invoiceItemType?.name
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
        },
        {
            title: 'Acciones',
            dataIndex: 'actions',
            key: 4,
            width: 100,
            render: (payment: Payment) => <Flex gap={16}>
                <Button>Editar</Button>
                <Button danger>Eliminar</Button>
            </Flex>
        }
    ]

    const userOptions = users.map(user => ({
        value: `${user.person.firstName} ${user.person.lastName} - ${user.role.name}`,
        label: `${user.person.firstName} ${user.person.lastName} - ${user.role.name}`
    }))

    interface FormFields {
        taxpayer: string,
        branchOffice: string,
        economicActivity: string,
        issuedDate: Date,
        expirationDate: Date
    }

    function onClose() {
        setOpen(false)
    }

    function onSubmit(values) {
        console.log({values})

        const newPaymentAllocation = {
            paymentId: values.paymentId,
            amountBs: values.amount,
            payment: payments.find(p => p.id === values.paymentId)
        }

        setPaymentAllocations([...paymentAllocations, newPaymentAllocation])
    }

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

                {/* Taxpayer */}
                <Descriptions size='small' layout='vertical' bordered>
                    <Descriptions.Item label='Empresa: '>{business?.businessName}</Descriptions.Item>
                    <Descriptions.Item label='RIF: '>{business?.dni}</Descriptions.Item>
                </Descriptions>

                <br/>


                {/* Created by */}
                <Form.Item<FormFields>
                    label='Creado por: '
                    name='createdByOption'
                >
                    <Select
                        options={userOptions}
                    />
                </Form.Item>

                {/* Checked by */}
                <Form.Item<FormFields>
                    label='Revisado por: '
                    name='checkedByOption'
                >
                    <Select
                        options={userOptions}
                    />
                </Form.Item>

                <Flex gap={16} wrap >
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
                </Flex>
                

                {/* Factura */}

                {/* Conceptos de Pago */}
                <Flex vertical style={{marginBottom: 16}}>
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
                </Flex>
                    

                {/* Pagos */}
                <Flex vertical style={{marginBottom: 16}}>
                    <Flex justify='space-between' align='center'>
                        <Typography.Title level={4}>Pagos</Typography.Title>
                        <Button onClick={() => setOpen(true)}>Nuevo Pago</Button>
                    </Flex>
                    <Table
                        dataSource={paymentAllocations}
                        columns={paymentAllocationColumns}
                        bordered
                        pagination={false}
                    />
                </Flex>

                <br/>

                {/* <Form.Item label='Horario'>
                    <TimePicker.RangePicker />
                </Form.Item> */}
                
                
                <Flex justify='end' gap={16}>
                    {isEdit 
                        ? (
                            <Form.Item>
                                <Button type='primary' htmlType='submit'>Actualizar</Button>
                            </Form.Item>
                        )
                        :(
                            <Form.Item>
                                <Button type='primary' htmlType='submit'>Guardar</Button>
                            </Form.Item>
                        )
                    }

                    {showActivateButton && (
                        <Form.Item>
                            <Button type='primary' htmlType='submit'>Activar</Button>
                        </Form.Item>
                    )}
                </Flex>

                <Modal
                    open={open}
                    onCancel={onClose}
                    footer={null}
                >
                    <PaymentAllocationForm payments={payments} onClose={onClose} onSubmit={onSubmit} />
                </Modal>

            </Form>
        </div>
    )
}


const PaymentAllocationForm = ({ payments, onClose, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onSubmit(values);
        onClose();
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="paymentId"
                label="Referencia de Pago"
                rules={[{ required: true, message: 'Por favor seleccione un pago' }]}
            >
                <Select placeholder="Seleccione un pago">
                    {payments.map(payment => (
                        <Select.Option key={payment.id} value={payment.id}>
                            {payment.reference}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="amount"
                label="Monto a Asignar"
                rules={[{ required: true, message: 'Por favor ingrese un monto' }]}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Asignar Pago
                </Button>
            </Form.Item>
        </Form>
    );
};