
import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Flex, Table, Typography, Button, Space, Popconfirm, InputRef, Form, Input, Card } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../util/api'
import { Business } from '../util/types'

const TaxCollection: React.FC = () => {

    const [business, setBusiness] = useState<Business[]>([])

    const [ form ] = Form.useForm();
    const search = Form.useWatch('search', form);

    const filteredBusinesses = useMemo(() => {
        return business.filter( b => {

            if (!search || search === '') {
                return true
            }

            return b.businessName.toLowerCase().includes(search.toLowerCase()) || b.dni.toLowerCase().includes(search.toLowerCase())
        })
    }, [business, search])

    useEffect(() => {
        loadBusinesses()

    }, [])

    async function loadBusinesses() {
        const fetchedBusinesses = await api.fetchBusiness()
        setBusiness(fetchedBusinesses)
    }

  return (
    <Card>
        <Flex vertical gap="large">
        <Typography.Title level={1}>Recaudación</Typography.Title>
        <Form form={form}>
                    <Form.Item name='search'>
                        <Input placeholder='Buscar por razón social o rif' prefix={<SearchOutlined />} />
                    </Form.Item>
                </Form>
        <SortableBusinessTable business={filteredBusinesses} />
        </Flex>
    </Card>
  );
};

export default TaxCollection;


import { SearchOutlined } from '@ant-design/icons';
const SortableBusinessTable: React.FC<{business: Business[]}> = ({business}) => {

    const navigate = useNavigate()

    const economicActivitiesTitle = useMemo(() => {
        console.log("calculating title for economic activities")
        return [...new Set(business.map( b => b.economicActivity.title))].map((title: string) => ({
            text: title,
            value: title
        }))
    }, [business])

    const columns = [
        {
            title: 'Razón Social',
            dataIndex: 'businessName',
            key: 'businessName',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a:Business, b:Business) => a.businessName.localeCompare(b.businessName),

            render: (value: string, record: Business) => {
                return <Typography.Text><Link to={`/tax-collection/${record.id}`}>{value}</Link></Typography.Text>
            },

            width: '300px',
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            
            sorter: (a:Business, b:Business) => a.dni.localeCompare(b.dni),
            width: '200px',
        },
        
        {
            title: 'Actividad Económica',
            dataIndex: ['economicActivity', 'title'],
            key: 'economicActivity',
            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: Business, b: Business) => a.economicActivity.title.localeCompare(b.economicActivity.title),
            
            filterSearch: true,
            onFilter: (value: string, record: Business) => {
                return record.economicActivity.title.includes(value)
            },

            filters: economicActivitiesTitle,

            width: 400,
        },
        {
            title: "Fiscal",
            dataIndex: 'fiscalId',
            key: 'fiscalId',

            filters: [... new Set(business.map( b => b?.fiscal?.username))].map( (username: string) => {
                let name = username ? username : "Sin Fiscal"

                return { text: name, value: name }
            }),

            showSorterTooltip: false,
            // sortDirections: ['ascend', 'descend', 'ascend'],
            
            sorter: (a: Business, b: Business) => {

                let aName = a.fiscalId ? a?.fiscal?.username : "--"
                let bName = b.fiscalId ? b?.fiscal?.username : "--"

                return aName.localeCompare(bName)
            },

            onFilter(value: string, record: Business) {
                if (value === 'Sin Fiscal') {
                    return !record?.fiscalId
                }

                return record?.fiscal?.username.includes(value)
            },

            render (value: string, record: Business) {
                return <Typography.Text>{record.fiscalId ? record?.fiscal?.username : '--'}</Typography.Text>
            }

        },
        // {
        //     title: '',
        //     key: 'actions',
        //     render: (_, business: Business) => {
        //         return (
        //             <Flex gap="small">
        //                 <Button
        //                     shape="circle"
        //                     onClick={() => {
        //                         console.log({ goingTo: business.id })
        //                         navigate(`edit/${business.id}`)
        //                     }
        //                     }
        //                 ><EditFilled /></Button>
        //             </Flex>
        //         )
        //     }
        // }
    ];

    return <Table 
        dataSource={business} 
        columns={columns} 
        style={{ overflow: 'auto'}}/>
}
