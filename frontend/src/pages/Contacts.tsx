import React, { useEffect, useRef, useState } from 'react'

import { Form, Input, Button, message, Typography, Select, Flex, Image, Table, Space} from 'antd'
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
            (<Link to={`/contacts/${record.id}`}>{text}</Link>)
    });


    const columns = [
        {
            title: 'Nombre y Apellido',
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: Person, b: Person) => a.firstName?.localeCompare(b.firstName),
            ...getColumnSearchProps('fullName'),
        },
        {
            title: 'Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,
            sorter: (a: Person, b: Person) => a.dni?.localeCompare(b.dni),
            ...getColumnSearchProps('dni')
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