import React, { useEffect, useRef, useState } from 'react'
import { Button, Flex, Input, InputRef, Popconfirm, Space, Table, Typography } from 'antd'
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';

import Highlighter from 'react-highlight-words';


import { useNavigate, Link } from "react-router-dom";
import _ from 'lodash'
import { b } from 'vitest/dist/suite-ynYMzeLu';

import * as api from '../util/api'



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

    function onNewTaxPayer() {
        navigate('/business/new')
    }



    async function loadBusiness() {
        console.log("before fetching business")
        setBusiness(await api.fetchBusiness())
        console.log("after fetching business")
    }

    async function deleteBusiness(id: number): Promise<void> {
        const url = `${HOST}/v1/businesses/${id}`;
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





    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);


    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Buscar
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && handleReset(clearFilters)
                            confirm({ closeDropdown: false });
                            close()
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Limpiar
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text, record) =>
            (<Link to={`/business/${record.id}`}>{text}</Link>)
    });








    const columns = [
        {
            title: 'Razón Social',
            dataIndex: 'businessName',
            key: 'businessName',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.businessName.localeCompare(b.businessName),
            ...getColumnSearchProps('businessName'),
        },
        {
            title: 'Rif o Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => a.dni.localeCompare(b.dni),
            ...getColumnSearchProps('dni'),
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
                            shape="circle"
                            onClick={() => {
                                console.log({ goingTo: business.id })
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
                                <DeleteFilled />
                            </Button>
                        </Popconfirm>
                    </Flex>
                )
            }
        }
    ];

    return (
        <div>
            <Flex gap="middle" align='center'>
                <Typography.Title level={1}>
                    Registro de Contribuyentes
                    
                </Typography.Title>
                <Button onClick={onNewTaxPayer}>
                    Nuevo
                </Button>
            </Flex>
                

            <Table
                dataSource={business}
                columns={columns}
            />
        </div>
    )
}

export default BusinessView

