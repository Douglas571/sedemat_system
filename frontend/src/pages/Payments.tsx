import React, { useState, useEffect } from 'react';
import type { PopconfirmProps } from 'antd';
import { Table, Button, Space, message, Popconfirm, Select, Typography, Flex } from 'antd';
import axios from 'axios';

import { CheckCircleFilled, CloseCircleFilled, DeleteFilled } from '@ant-design/icons';

import { useNavigate, Link } from 'react-router-dom';
import { render } from '@testing-library/react';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

interface Payment {
    id: number;
    amount: number;
    reference: string;
    dni: string;
    account: string;
    paymentDate: string;
    businessName: string;
    image: string;
    isVerified: boolean,
    liquidationDate?: Date
}

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
        console.log({ data });
    } catch (error) {
        console.log("I got an error...");
        console.error('Fetch error:', error);
        throw error;
    }

    return payments;
}

function Payments(): JSX.Element {
    const [messageApi, contextHolder] = message.useMessage()
    const [dataSource, setDataSource] = useState<Array<any>>([]);

    const navigate = useNavigate()

    const fetchPayments = async () => {
        console.log("Cargando pagos...")
        try {
            const payments = await getPayments();
            const mappedData = payments.map(payment => {
                const newPayment = {
                    id: payment.id,
                    key: payment.id.toString(),
                    amount: payment.amount,
                    reference: payment.reference,
                    dni: payment.dni,
                    account: payment.account,
                    paymentDate: new Date(payment.paymentDate).toLocaleDateString(),
                    businessName: payment.businessName,
                    image: payment.image,
                    isVerified: payment.isVerified,
                    status: '',
                    businessId: payment.businessId,
                    personId: payment.personId,
                    business: payment.business,
                    person: payment.person,
                }

                if (payment.isVerified) {
                    newPayment.status = "Verificado"
                } else {
                    newPayment.status = "Recibido"
                }

                if (payment.liquidationDate) {
                    newPayment.status = "Liquidado"
                }

                console.log({ newPayment })

                return newPayment
            });
            setDataSource(mappedData);
            console.log({ mappedData })
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);


    async function sendUpdateVerifiedStatus(paymentId: string, isVerified: boolean) {
        const url = `${HOST}/v1/payments/${paymentId}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isVerified })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Payment status updated successfully:', result);
            } else {
                const error = await response.json();
                console.error('Failed to update payment status:', error);
            }
        } catch (error) {
            console.error('Error making request:', error);
        }
    }


    async function updateVerifiedStatus(id: string, isVerified: boolean) {
        try {
            await sendUpdateVerifiedStatus(id, isVerified)

            fetchPayments()
        } catch (error) {
            console.log({ error })
        }
    }

    function showBoucher(imageUrl: string) {
        window.open(`${HOST}/${imageUrl}`, '_blank', 'noopener,noreferrer');
    }

    async function sendRequestToDeletePayment(id) {
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


    const deletePayment = async (id: string) => {
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

    const columns = [
        {
            title: 'Nombre o Razón Social',
            dataIndex: 'businessName',
            key: 'businessName',
            render: (text: string, record: Payment) => {
                if (record.businessId) {
                    return record.business.businessName
                } else {
                    return `${record?.person?.firstName} ${record?.person?.lastName}`
                }
            }
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
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
            }
        },
        {
            title: 'Referencia',
            dataIndex: 'reference',
            key: 'reference',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.reference.localeCompare(b.reference),
            render: (text: string, record) => {
                console.log({ record })
                return <Link to={`/payments/${record.key}`}>{text}</Link>
            }
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            key: 'amount',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Cuenta Destino',
            dataIndex: 'account',
            key: 'account',
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
            key: 'status'
        },
        {
            title: 'Acciones',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">

                    <Button
                        onClick={() => updateVerifiedStatus(record.key, !record.isVerified)}
                        shape="circle"
                    >{record.isVerified ? <CloseCircleFilled /> : <CheckCircleFilled />}</Button>

                    <Popconfirm
                        title="Eliminar Pago"
                        description="¿Estás seguro de que deseas eliminar el pago?"
                        onConfirm={() => {
                            console.log("the payment will be deleted")
                            deletePayment(record.key)
                        }}
                        //onCancel={cancel}
                        okText="Si"
                        cancelText="No"
                    >
                        <Button danger shape="circle"><DeleteFilled /></Button>
                    </Popconfirm>

                    <Button onClick={() => navigate(`/payments/${record.key}`)}>Editar</Button>
                    <Button onClick={() => showBoucher(record.image)}>Boucher</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}
            <Flex justify='space-between' align='center'>
                <Typography.Title level={1}> Pago</Typography.Title>
                <Button onClick={() => navigate('new')}>
                    Nuevo
                </Button>
            </Flex>

            <Table
                dataSource={dataSource}
                columns={columns}
            />
        </div>
    )


};

export default Payments