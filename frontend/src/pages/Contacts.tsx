import React, { useEffect, useRef, useState } from 'react'

import { Form, Input, Button, message, Typography, Select, Flex, Image, Table, Space, Popconfirm} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'

import { SearchOutlined } from '@ant-design/icons';

import Highlighter from 'react-highlight-words';

export default function Contacts(): JSX.Element {

    const [contacts, setContacts] = useState<Person[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const contactsData = await api.getPeople()

            setContacts(contactsData)

        } catch(error) {
            console.error({error})
        }
    }

    async function handleDelete(id: number) {
        try {
            await api.deletePerson(id)
            loadData()
        } catch(error) {
            console.error({error})
            message.error('Error al eliminar el contacto')
        }
    }

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
        
        render: (text: string, record: Person) =>
            (<Link to={`/contacts/${record.id}`}>{text}</Link>)
    });


    const columns = [
        {
            title: 'Nombre y Apellido',
            dataIndex: 'fullName',
            key: 'fullName',
            
            
            sorter: (a: Person, b: Person) => a.firstName?.localeCompare(b.firstName),

            

            filters: contacts.map((c: Person) => {

                return {
                    text: c.fullName,
                    value: c.fullName
                }
            }),

            ...getColumnSearchProps('fullName'),

            
        },
        {
            title: 'Cédula',
            dataIndex: 'dni',
            key: 'dni',
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,

            filters: contacts.map((c: Person) => {

                return {
                    text: c.dni,
                    value: c.dni
                }
            }),

            sorter: (a: Person, b: Person) => a.dni?.localeCompare(b.dni),

            ...getColumnSearchProps('dni'),
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,
            sorter: (a: Person, b: Person) => a.phone?.localeCompare(b.phone),
        },
        {
            title: 'Correo',
            dataIndex: 'email',
            key: 'email',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,
            sorter: (a: Person, b: Person) => a.email?.localeCompare(b.email),
        },
        {
            title: 'Acciones',
            dataIndex: 'actions',
            key: 'actions',
            render: (text: string, record: Person) => 
            <Flex>
                <Popconfirm
                        title="Eliminar Pago"
                        description="¿Estás seguro de que deseas eliminar el contacto?"
                        onConfirm={() => {
                            console.log("the contact will be deleted")
                            handleDelete(record.id)
                        }}
                        //onCancel={cancel}
                        okText="Si"
                        cancelText="No"
                    >
                    <Button danger>Eliminar</Button>
                </Popconfirm>
            </Flex>
        }

    ]
    return (
        <>
            <Flex gap={'middle'} align='center' justify='space-between'>
                <Typography.Title>
                    Contactos
                </Typography.Title>
                <Button onClick={() => navigate("new")}>
                    Nuevo
                </Button>
            </Flex>
            
            <Table 
                dataSource={contacts.map(r => ({...r, key: r.id}))}
                columns={columns}
            />
        </>
    )
}