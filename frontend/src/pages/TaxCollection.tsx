
import React, { useState, useEffect, useRef } from 'react';

import { Flex, Table, Typography, Button, Input, Space, Popconfirm, InputRef } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../util/api'
import { Business } from '../util/types'

const TaxCollection: React.FC = () => {

    const [business, setBusiness] = useState<Business[]>([])

    useEffect(() => {
        loadBusinesses()

    }, [])

    async function loadBusinesses() {
        const fetchedBusinesses = await api.fetchBusiness()
        setBusiness(fetchedBusinesses)
    }

  return (
    <Flex vertical gap="large">
      <Typography.Title level={1}>Recaudación</Typography.Title>
      <SortableBusinessTable business={business} />
    </Flex>
  );
};

export default TaxCollection;


import { SearchOutlined } from '@ant-design/icons';
const SortableBusinessTable: React.FC<{business: Business[]}> = ({business}) => {

    const navigate = useNavigate()

    const columns = [
        {
            title: 'Razón Social',
            dataIndex: 'businessName',
            key: 'businessName',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a:Business, b:Business) => a.businessName.localeCompare(b.businessName),

            filterIcon: (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            filters: business.map(b => ({
                text: b.businessName,
                value: b.businessName
            })),
            filterMode: 'menu',
            filterSearch: true,
            onFilter: (value: string, record: Business) => {
                return record.businessName.includes(value)
            },

            render: (value: string, record: Business) => {
                return <Typography.Text><Link to={`/tax-collection/${record.id}`}>{value}</Link></Typography.Text>
            }
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            filterIcon: (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            filters: business.map(b => ({
                text: b.dni,
                value: b.dni
            })),
            filterMode: 'menu',
            filterSearch: true,
            onFilter: (value: string, record: Business) => {
                console.log({value, record})
                return record.dni.includes(value)
            },
            sorter: (a:Business, b:Business) => a.dni.localeCompare(b.dni),
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

    return <Table dataSource={business} columns={columns} />
}
