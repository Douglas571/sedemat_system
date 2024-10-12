import React, { useEffect, useRef, useState } from 'react'
import { Button, Flex, Input, InputRef, Popconfirm, Space, Table, Typography, message } from 'antd'
import { EditFilled, DeleteFilled, SearchOutlined } from '@ant-design/icons';


import { useNavigate, Link } from "react-router-dom";
import _ from 'lodash'
import { b } from 'vitest/dist/suite-ynYMzeLu';

import * as api from '../util/api'
import * as businessService from '../util/businessesApi';
import useAuthentication from '../hooks/useAuthentication';



const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type Business = {
    id: number
    businessName: string
    dni: string
    email: string
}

function BusinessView(): JSX.Element {

    const [business, setBusiness] = React.useState([])

    const { userAuth } = useAuthentication()

    const navigate = useNavigate();


    function onNewTaxPayer() {
        navigate('/business/new')
    }



    async function loadBusiness() {
        console.log("before fetching business")
        setBusiness(await api.fetchBusiness())
        console.log("after fetching business")
    }

    async function deleteBusiness(id: number): Promise<void> {
        
        try {
            await businessService.deleteBusiness(id, userAuth.token);
        } catch (error) {
            console.error('Error deleting business:', error);
            message.error(error.message);
        }
    }

    useEffect(() => {
        loadBusiness()
    }, [])

    const columns = [
        {
            title: 'Razón Social',
            dataIndex: 'businessName',
            key: 'businessName',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: Business, b: Business) => a.businessName.localeCompare(b.businessName),
            //...getColumnSearchProps('businessName'),
            
            filterIcon: (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            filters: business.map((b: Business) => ({
                text: b.businessName,
                value: b.businessName
            })),
            filterMode: 'menu',
            filterSearch: true,
            onFilter: (value: string, record: Business) => {
                return record.businessName.includes(value)
            },

            render: (value: string, record: Business) => {
                return <Typography.Text><Link to={`/business/${record.id}`}>{value}</Link></Typography.Text>
            }

        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: Business, b: Business) => a.dni.localeCompare(b.dni),
            // ...getColumnSearchProps('dni'),

            filterIcon: (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            filters: business.map((b: Business) => ({
                text: b.dni,
                value: b.dni
            })),
            filterMode: 'menu',
            filterSearch: true,
            onFilter: (value: string, record: Business) => {
                return record.dni.includes(value)
            },
        },
        // {
        //     title: 'Correo',
        //     dataIndex: 'email',
        //     key: 'email',
        //     sortDirections: ['ascend', 'descend', 'ascend'],
        //     sorter: (a, b) => a.email.localeCompare(b.email),
        // },
        {
            title: '',
            key: 'actions',
            render: (_, business: Business) => {
                return (
                    <Flex gap="small">
                        <Button
                            // shape="circle"
                            onClick={() => {
                                console.log({ goingTo: business.id })
                                navigate(`edit/${business.id}`)
                            }
                            }
                        ><EditFilled />Editar</Button>

                        <Popconfirm
                            title="Eliminar Pago"
                            description="¿Estás seguro de que deseas eliminar esta empresa?"
                            onConfirm={async () => {
                                console.log("the business will be deleted")
                                await deleteBusiness(business.id)
                                loadBusiness()
                            }}
                            //onCancel={cancel}
                            okText="Si"
                            cancelText="No"
                        >
                            <Button
                                danger
                                // shape="circle"
                            >
                                <DeleteFilled />
                                Eliminar
                            </Button>
                        </Popconfirm>
                    </Flex>
                )
            }
        }
    ];

    return (
        <div>
            <Flex gap="middle" align='center' justify='space-between'>
                <Typography.Title level={1}>
                    Registro de Contribuyentes
                    
                </Typography.Title>
                <Button onClick={onNewTaxPayer}>
                    Nuevo
                </Button>
            </Flex>
                

            <Table
                style={{ overflow: 'scroll' }}
                dataSource={business}
                columns={columns}
                rowKey={b => b.id}
            />
        </div>
    )
}

export default BusinessView

