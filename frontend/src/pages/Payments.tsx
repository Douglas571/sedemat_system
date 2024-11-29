import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { TimeRangePickerProps } from 'antd';

import { Button, Card, Flex, message, Popconfirm, Select, Space, Table, Typography, Badge, Form, Input, DatePicker, Checkbox } from 'antd';

import { CheckCircleFilled, CloseCircleFilled, DeleteFilled, FilterOutlined } from '@ant-design/icons';

import axios from 'axios';


import { Payment } from '../util/types';
import { formatBolivares } from '../util/currency';

import * as paymentService from '../util/paymentsApi'

import * as util from '../util'

import useAuthentication from 'hooks/useAuthentication';

import dayjs from 'dayjs';

import ROLES from '../util/roles';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT



const datePresetRanges: TimeRangePickerProps['presets'] = [
    { label: 'Hoy', value: [dayjs(), dayjs()] },
    { label: 'Esta Semana', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'Este Mes', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Este Año', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];


async function getPayments(token?: string, filters?: any): Promise<Array<Payment>> {

    let payments: Array<Payment> = [];

    try { 
        const response = await axios.get(`${HOST}/v1/payments`, {
            params: {
                ...filters
            }
        });

        const data = await response.data;
        console.log('I got the data...');
        payments = data;
        // console.log({ data });
    } catch (error) {

        console.log("I got an error...");
        console.error('Fetch error:', error);

        throw error;
    }

    return payments;
}

function Payments(): JSX.Element {
    const [messageApi, contextHolder] = message.useMessage()
    const [dataSource, setDataSource] = useState<Payment[]>([]);

    let { userAuth } = useAuthentication()

    const navigate = useNavigate()

    const [contacts, setContacts] = useState<Person[]>([])

    const [ form ] = Form.useForm();

    const search = Form.useWatch('search', form);

    const filteredPayments = useMemo(() => {
        return dataSource.filter((payment) => {
            if (!search || search === '') {
                return true;
            }
            return payment?.business?.businessName.toLowerCase().includes(search.toLowerCase()) || payment?.business?.dni.replaceAll('.', '').toLowerCase().includes(search.replaceAll('.', '').toLowerCase()) || payment.reference?.toLowerCase().includes(search.toLowerCase());
        })
    }, [dataSource, search]);

    const fetchPayments = async () => {
        // console.log("Cargando pagos...")

        let {dateRange, notVerified} = form.getFieldsValue()

        let from  
        let to 

        if (dateRange) {
            from = dayjs(dateRange[0]).format('YYYY-MM-DD')
            to = dayjs(dateRange[1]).format('YYYY-MM-DD')
        }

        try {
            const payments = await getPayments(undefined, {
                from, to, notVerified
            });
            // console.log({payments})
            const mappedData = payments.map(payment => {
                const newPayment = {
                    ...payment,
                    paymentDate: new Date(payment.paymentDate).toLocaleDateString(),
                }

                if (payment.isVerified) {
                    newPayment.status = "Verificado"
                } else {
                    newPayment.status = "No verificado"
                }

                if (payment.liquidationDate) {
                    newPayment.status = "Liquidado"
                }

                // console.log({ newPayment })

                return newPayment
            });
            setDataSource(mappedData);
            // console.log({ mappedData })
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    async function updateVerifiedStatus(id: string, isVerified: boolean) {
        try {            
            // TODO: Implement a controle to set this information manually

            let checkedAt: dayjs.Dayjs | null = dayjs().utc()
            let receivedAt: dayjs.Dayjs | null = dayjs().utc()

            if (isVerified) {
                checkedAt = null
                receivedAt = null
            }

            console.log({ isVerified, checkedAt, receivedAt })
            
            // let paymentUpdated = await paymentService.updatePayment({id: Number(id), checkedAt, receivedAt}, userAuth.token)

            let paymentUpdatedStatus = await paymentService.updateVerifiedStatus(Number(id), {checkedAt, receivedAt}, userAuth.token)

            fetchPayments()
        } catch (error) {
            console.log({ error })
            message.error(error.message)
        }
    }

    function showBoucher(imageUrl: string) {
        window.open(`${HOST}/${imageUrl}`, '_blank', 'noopener,noreferrer');
    }

    async function sendRequestToDeletePayment(id: number) {
        const url = `${HOST}/v1/payments/${id}`;

        console.log('deleting payment ' + id)
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // const result = await response.json();
        // console.log({ result })
        if (response.ok) {
            console.log('Payment deleted successfully');
        } else {
            // console.log({ result })
            throw Error('Error al eliminar el pago');
        }
    }


    const deletePayment = async (id: number) => {
        try {
            // send the request
            // await sendRequestToDeletePayment(id)

            let res = await paymentService.deletePayment(id, userAuth.token)

            // deleted successfully, reload payments
            fetchPayments()
        }
        catch (error) {
            // if it fail
            // show error
            console.log({ error })
            messageApi.error("Error al eliminar el pago")
        }
    }

    const getColumnSearchProps = (dataIndex: string): TableColumnType<DataType> => ({

        // sortDirections: ['ascend', 'descend', 'ascend'],
        showSorterTooltip: false,
        filterMode: 'menu',
        filterSearch: true,
        
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value: string, record: Person) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        
        // render: (text: string, record: Person) =>
        //     (<Link to={`/contacts/${record.id}`}>{text}</Link>)
    });

    const filterIconProp = {
        // filterIcon: (filtered: boolean) => (
        //     <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        // ),
    }

    // TODO: Sort this object
    const columns = [
        {
            title: 'Nombre o Razón Social',
            dataIndex: '',
            key: 'businessName',

            // sortDirections: ['ascend', 'descend', 'ascend'],
            showSorterTooltip: false,

            render: (text: string, record: Payment) => {
                // console.log({record, text})
                if (record.businessId) {
                    return <Link to={`/tax-collection/${record.business.id}`}>
                    {record.business.businessName}</Link>
                } else {
                    return `${record?.person?.firstName} ${record?.person?.lastName}`
                }
            },

            sorter: (a: Payment, b: Payment) => {
                
                if (a.businessId) {
                    return a.business.businessName.localeCompare(b.business.businessName)
                } else {
                    return a.person.firstName.localeCompare(b.person.firstName)
                }
            },
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],

            sorter: (a, b) => {
                if (a.businessId) {
                    return a.business?.dni.localeCompare(b.business?.dni)
                } else {
                    return a.person?.dni.localeCompare(b.person?.dni)
                }
            },

            render: (text: string, record: Payment) => {
                if (record.businessId) {
                    return record?.business?.dni
                } else {
                    return record?.person?.dni
                }
            },

        },
        {
            title: 'Referencia',
            dataIndex: 'reference',
            key: 'reference',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],

            sorter: (a, b) => Number(a.reference) - Number(b.reference),
            render: (text: string, record: Payment) => {
                // return <Link to={`/payments/${record.id}`}>{text}</Link>
                return text
            },

        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            key: 'amount',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.amount - b.amount,
            render(text: string, record: Payment) {
                return formatBolivares(text)
            }
        },
        {
            title: 'Cuenta Destino',
            dataIndex: 'account',
            key: 'account',
            render: (text: string, record: Payment) => {
                return record.bank?.accountNumber.slice(-4)
            },
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.account.localeCompare(b.account),

            filters: [...new Set(dataSource.map((payment) => {
                return payment.bank.accountNumber.slice(-4)
            }))].map(t => {
                return { text: t, value: t }
            }),

            onFilter: (value: string, record: Payment) => record.bank.accountNumber.slice(-4) === (value as string),

            ...filterIconProp
        },
        {
            title: 'Fecha de Pago',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => dayjs(a.paymentDate).isBefore(b.paymentDate) ? -1 : 1,
        },
        {
            title: 'Fecha de Verificación',
            dataIndex: 'checkedAt',
            key: 'checkedAt',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => dayjs(a.checkedAt).isBefore(b.checkedAt) ? -1 : 1,

            render: (text: string, record: Payment) => {
                
                if (text) {
                    return dayjs(text).format('DD/MM/YYYY')
                } else {
                    return '--'
                }
            }
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],

            render: (text: string, record: Payment) => {
                return (<Badge status={record.isVerified ? 'success' : 'warning'} text={text} />)
            },

            sorter: (a, b) => a.status.localeCompare(b.status),

            filters: [...new Set(dataSource.map((payment) => {
                return payment.status
            }))].map(t => {
                return { text: t, value: t }
            }),

            onFilter: (value: string, record: Payment) =>
                record.status
                    .toString()
                    .toLowerCase() === ((value as string).toLowerCase()),

            ...filterIconProp
        },
        {
            title: 'Acciones',
            key: 'action',
            render: (_: any, record: Payment) => {
                // console.log({record})
                return (
                <Space size="middle">

                    { userAuth?.user?.roleId === ROLES.LIQUIDATOR && (<Button
                        onClick={() => updateVerifiedStatus(record.id, record.isVerified)}
                        shape="circle"
                    >{record.isVerified ? <CloseCircleFilled /> : <CheckCircleFilled />}</Button>) }
                    

                    <Popconfirm
                        title="Eliminar Pago"
                        description="¿Estás seguro de que deseas eliminar el pago?"
                        onConfirm={() => {
                            console.log("thes payment will be deleted")
                            deletePayment(record.id)
                        }}
                        //onCancel={cancel}
                        okText="Si"
                        cancelText="No"
                    >
                        <Button danger shape="circle"><DeleteFilled /></Button>
                    </Popconfirm>

                    <Button onClick={() => navigate(`/payments/${record.id}`)}>Editar</Button>

                    {
                        <a href={util.completeUrl('/' + record?.image) ?? ''} target="_blank" rel="noopener noreferrer">Voucher</a>
                    }

                    {
                        record?.grossIncomeInvoiceId && (
                            <Link to={'/gross-income-invoices/' + record?.grossIncomeInvoiceId}
                        >Liquidación</Link>
                        )
                    }
                </Space>
            )},
        },
    ];

    return (
        <div>
            {contextHolder}
            <Card title={
                <Flex justify='space-between' align='center'>
                    <Typography.Title level={1}> Pago</Typography.Title>
                    <Button onClick={() => navigate('new')} icon={<PlusOutlined />}>
                        Agregar
                    </Button>
                </Flex>
            }>
                <Form form={form}
                    initialValues={
                        {
                            search: '',
                            dateRange: datePresetRanges[2].value, // this month
                            notVerified: false
                        }
                    }>
                    <Form.Item name='search'>
                        <Input placeholder='Buscar por razón social, rif, cédula, o referencia de pago' prefix={<SearchOutlined />} />
                    </Form.Item>

                    <Flex gap={10}>
                        <Form.Item name='dateRange'>
                            <DatePicker.RangePicker
                                format="DD/MM/YYYY"
                                presets={datePresetRanges}
                            />
                        </Form.Item>

                        <Form.Item name='notVerified' valuePropName='checked'>
                            <Checkbox>No Verificados</Checkbox>
                        </Form.Item>

                        <Button 
                            icon={<FilterOutlined />}
                            onClick={fetchPayments}>
                            Filtrar
                        </Button>
                    </Flex>
                    
                </Form>
                <Table
                    dataSource={filteredPayments}
                    columns={columns}
                    // style={{ overflow: 'scroll' }}
                    virtual
                />
            </Card>
        </div>
    )


};

export default Payments