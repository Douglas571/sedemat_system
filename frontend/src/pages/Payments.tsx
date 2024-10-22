import { ConsoleSqlOutlined, PlusOutlined } from '@ant-design/icons';
import type { PopconfirmProps } from 'antd';
import { Button, Card, Flex, message, Popconfirm, Select, Space, Table, Typography, Badge } from 'antd';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { CheckCircleFilled, CloseCircleFilled, DeleteFilled } from '@ant-design/icons';

import { SearchOutlined } from '@ant-design/icons';

import { render } from '@testing-library/react';
import { Link, useNavigate } from 'react-router-dom';

import { Payment } from '../util/types';
import { formatBolivares } from '../util/currency';

import * as paymentService from '../util/paymentsApi'

import useAuthentication from 'hooks/useAuthentication';

import dayjs from 'dayjs';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT


async function getPayments(): Promise<Array<Payment>> {

    let payments: Array<Payment> = [];

    try {
        const response = await fetch(`${HOST}/v1/payments`);
        if (!response.ok) {
            throw new Error(`Error fetching payments: ${response.statusText}`);
        }
        const data = await response.json();
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

    const fetchPayments = async () => {
        // console.log("Cargando pagos...")
        try {
            const payments = await getPayments();
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

            let checkedAt = dayjs().utc()
            let receivedAt = dayjs().utc()

            if (isVerified) {
                checkedAt = null
                receivedAt = null
            }

            console.log({ isVerified, checkedAt, receivedAt })
            
            let paymentUpdated = await paymentService.updatePayment({id: Number(id), checkedAt, receivedAt}, userAuth.token)

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
            await sendRequestToDeletePayment(id)

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

        sortDirections: ['ascend', 'descend', 'ascend'],
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

            sortDirections: ['ascend', 'descend', 'ascend'],
            showSorterTooltip: false,
            filterMode: 'menu',
            filterSearch: true,

            render: (text: string, record: Payment) => {
                // console.log({record, text})
                if (record.businessId) {
                    return record.business.businessName
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

            filters: [...new Set(dataSource.map((payment) => {
                if(payment.businessId) return payment.business.businessName
                else return `${payment?.person?.firstName} ${payment?.person?.lastName}`
            }))].map(t => {
                // console.log(t)
                return { text: t, value: t }
            }),

            onFilter: (value: string, record: Payment) =>
                record ? record.business['businessName']
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase()) : false,
            
            ...filterIconProp,
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],

            filterSearch: true,
            onFilter: (value: string, record: Payment) =>
                record ? record?.business['dni']
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase()) : false,

            sorter: (a, b) => {
                if (a.businessId) {
                    return a.business?.dni.localeCompare(b.business?.dni)
                } else {
                    return a.person?.dni.localeCompare(b.person?.dni)
                }
            },

            filters: [...new Set(dataSource.map((payment) => {
                if(payment.businessId) return payment.business.dni
                else return payment?.person?.dni
            }))].map(t => {
                return { text: t, value: t }
            }),

            render: (text: string, record: Payment) => {
                if (record.businessId) {
                    return record?.business?.dni
                } else {
                    return record?.person?.dni
                }
            },

            ...filterIconProp,


        },
        {
            title: 'Referencia',
            dataIndex: 'reference',
            key: 'reference',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],

            filterSearch: true,
            onFilter: (value: string, record: Payment) => {
                if (!record?.reference) return false
                
                return record.reference.toLowerCase() === (value as string).toLowerCase()
            },

            sorter: (a, b) => a.reference.localeCompare(b.reference),
            render: (text: string, record: Payment) => {
                return <Link to={`/payments/${record.id}`}>{text}</Link>
            },

            filters: dataSource.map((payment) => {
                return { text: payment.reference, value: payment.reference }
            }),
            
            ...filterIconProp
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            key: 'amount',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
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
            sortDirections: ['ascend', 'descend', 'ascend'],
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
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.paymentDate.localeCompare(b.paymentDate),
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],

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

                    <Button
                        onClick={() => updateVerifiedStatus(record.id, record.isVerified)}
                        shape="circle"
                    >{record.isVerified ? <CloseCircleFilled /> : <CheckCircleFilled />}</Button>

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
                    <Button onClick={() => showBoucher(record.image)}>Boucher</Button>
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
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    style={{ overflow: 'scroll' }}
                />
            </Card>
        </div>
    )


};

export default Payments