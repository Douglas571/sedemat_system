import React, { useEffect } from 'react'
import { Button, Popconfirm, Table } from 'antd'
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import { useNavigate, Link } from "react-router-dom";
import _ from 'lodash'
import { b } from 'vitest/dist/suite-ynYMzeLu';



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
    const navigate = useNavigate();

    
    async function fetchBusiness() {
        console.log("fetching business api")
        try {
            const response = await fetch(`${HOST}/v1/businesses`);
            if (!response.ok) {
                throw new Error(`Failed to fetch data. Status: ${response.status}`);
            }
            const data = await response.json();
            console.log({data})
            return data.map(b => ({...b, key: b.id}));
        } catch (error) {
            console.error('Error fetching business data:', error);
            throw error;
        }
    }

    async function loadBusiness() {
        console.log("before fetching business")
        setBusiness(await fetchBusiness())
        console.log("after fetching business")
    }

    async function deleteBusiness(id: number): Promise<void> {
        const url = `${HOST}/v1/businesses/${id}`;  // Replace HOST with your actual host URL
    
        try {
            const response = await fetch(url, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete business: ${response.statusText}`);
            }
    
            console.log(`Business with ID ${id} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting business:', error);
            throw error;
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
            render: (text, record) => <Link to={`/business/${record.id}`}>{text}</Link>,
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
            render: (_, business: Business) => {
                return (
                    <div>
                        <Button
                            shape="circle"
                            onClick={() => 
                                {
                                    console.log({goingTo: business.id})
                                    navigate(`edit/${business.id}`)
                                }
                            }
                        ><EditFilled /></Button>

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
                                shape="circle"
                            >
                                <DeleteFilled/>
                            </Button>
                        </Popconfirm>

                        <Link to = {`/business/${business.id}`}>
                            Ver Más
                        </Link>
                    </div>
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