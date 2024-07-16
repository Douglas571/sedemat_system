import React, { useEffect } from 'react'
import { Button, Table } from 'antd'
import _ from 'lodash'

import { EditFilled } from '@ant-design/icons';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type Business = {
    businessName: string // Razón Social
    dni: string // Rif o Cédula
    email: string // Correo
}

function BusinessView(): JSX.Element {

    const [business, setBusiness] = React.useState([])

    
    async function fetchBusiness() {
        try {
            const response = await fetch(`${HOST}/v1/businesses`);
            if (!response.ok) {
                throw new Error(`Failed to fetch data. Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching business data:', error);
            throw error;
        }
    }

    async function loadBusiness() {
        setBusiness(await fetchBusiness())
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
            sorter: (a, b) => a.businessName.localeCompare(b),
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.businessName.localeCompare(b),
        },
        {
            title: 'Correo',
            dataIndex: 'email',
            key: 'email',
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.businessName.localeCompare(b),
        },
        {
            title: '',
            key: 'actions',
            render: (_, business) => {
                return (
                    <Button
                        shape="circle"
                        onClick={() => console.log("editing", business.businessName)}
                    ><EditFilled /></Button>
                )
            }
        }
    ];

    return (
        <div>
            <h1>Contribuyentes</h1>
            <Table
                dataSource={business}
                columns={columns} 
            />

        </div>
    )
}

export default BusinessView