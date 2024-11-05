import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Flex, Input, InputRef, Popconfirm, Space, Table, Typography, message, Form, Card } from 'antd'
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

    const [ form ] = Form.useForm();

    const search = Form.useWatch('search', form);

    const [business, setBusiness] = React.useState([])

    const filteredBusinesses = useMemo(() => {
        return business.filter( b => {

            if (!search || search === '') {
                return true
            }

            return b.businessName.toLowerCase().includes(search.toLowerCase()) || b.dni.toLowerCase().includes(search.toLowerCase())
        })
    }, [business, search])

    console.log({filteredBusinesses})

    const { userAuth } = useAuthentication()

    const navigate = useNavigate();

    function onNewTaxPayer() {
        navigate('/business/new')
    }

    const economicActivitiesTitle = useMemo(() => {
        console.log("calculating title for economic activities")
        return [...new Set(business.map( b => b.economicActivity.title))].map((title: string) => ({
            text: title,
            value: title
        }))
    }, [business])

    const businessNames = useMemo(() => {
        return business.map( b => ({
            text: b.businessName,
            value: b.businessName
        }))
    }, [business])

    const businessDNIs = useMemo(() => {
        return business.map( b => ({
            text: b.dni,
            value: b.dni
        }))
    }, [business])


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
            
            // filters: businessNames,
            // filterMode: 'menu',
            // filterSearch: true,
            // onFilter: (value: string, record: Business) => {
            //     return record.businessName.includes(value)
            // },

            render: (value: string, record: Business) => {
                return <Typography.Text><Link to={`/business/${record.id}`}>{value}</Link></Typography.Text>
            },

            width: 300,

        },
        {
            title: 'Rif',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: Business, b: Business) => a.dni.localeCompare(b.dni),
            // ...getColumnSearchProps('dni'),

            // filters: businessDNIs,
            // filterMode: 'menu',
            // filterSearch: true,
            // onFilter: (value: string, record: Business) => {
            //     return record.dni.includes(value)
            // },

            width: 200,
        },
        {
            title: 'Actividad Económica',
            dataIndex: ['economicActivity', 'title'],
            key: 'economicActivity',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: Business, b: Business) => a.economicActivity.title.localeCompare(b.economicActivity.title),
            
            filterSearch: true,
            onFilter: (value: string, record: Business) => {
                return record.economicActivity.title.includes(value)
            },

            filters: economicActivitiesTitle,

            width: 400,
        },
        // {
        //     title: 'Correo',
        //     dataIndex: 'email',
        //     key: 'email',
        //     sortDirections: ['ascend', 'descend', 'ascend'],
        //     sorter: (a, b) => a.email.localeCompare(b.email),
        // },
        // {
        //     title: '',
        //     key: 'actions',
        //     render: (_, business: Business) => {
        //         return (
        //             <Flex gap="small">
        //                 <Button
        //                     // shape="circle"
        //                     onClick={() => {
        //                         console.log({ goingTo: business.id })
        //                         navigate(`edit/${business.id}`)
        //                     }
        //                     }
        //                 ><EditFilled />Editar</Button>

        //                 <Popconfirm
        //                     title="Eliminar Pago"
        //                     description="¿Estás seguro de que deseas eliminar esta empresa?"
        //                     onConfirm={async () => {
        //                         console.log("the business will be deleted")
        //                         await deleteBusiness(business.id)
        //                         loadBusiness()
        //                     }}
        //                     //onCancel={cancel}
        //                     okText="Si"
        //                     cancelText="No"
        //                 >
        //                     <Button
        //                         danger
        //                         // shape="circle"
        //                     >
        //                         <DeleteFilled />
        //                         Eliminar
        //                     </Button>
        //                 </Popconfirm>
        //             </Flex>
        //         )
        //     }
        // }
    ];

    return (
        <Card>
            <Flex gap="middle" align='center' justify='space-between'>
                <Typography.Title level={1}>
                    Registro de Contribuyentes
                    
                </Typography.Title>
                <Button onClick={onNewTaxPayer}>
                    Nuevo
                </Button>
            </Flex>
                
            <Form form={form}>
                <Form.Item name='search'>
                    <Input placeholder='Buscar por razón social' prefix={<SearchOutlined />} />
                </Form.Item>
            </Form>

            <Table
                style={{ overflow: 'scroll' }}
                dataSource={filteredBusinesses}
                columns={columns}
                rowKey={b => b.id}
            />
        </Card>
    )
}

export default BusinessView

