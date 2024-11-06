import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Form, Input, Button, message, Typography, Select, Flex, Image, Table, Space, Popconfirm, Card} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'

import { SearchOutlined } from '@ant-design/icons';

export default function Contacts(): JSX.Element {

    const [contacts, setContacts] = useState<Person[]>([])
    const navigate = useNavigate()

    const [ form ] = Form.useForm();

    const search = Form.useWatch('search', form);

    const filteredContacts = useMemo(() => {
        return contacts.filter( c => {

            if (!search || search === '') {
                return true
            }

            let fullName = `${c.firstName} ${c.lastName}`

            return fullName?.toLowerCase().includes(search.toLowerCase()) 
            || (c.dni ? c.dni.toLowerCase()?.includes(search.toLowerCase()) : false)
            
            || (c.dni ? c.dni.replaceAll('.', '').toLowerCase()?.includes(search.replaceAll('.', '').toLowerCase()) : false)
        })
    }, [contacts, search])

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

    const columns = [
        {
            title: 'Nombre y Apellido',
            dataIndex: 'fullName',
            key: 'fullName',
            
            render: (text: string, record: Person) =>
                (<Link to={`/contacts/${record.id}`}>{text}</Link>),
            
            sorter: (a: Person, b: Person) => a.firstName?.localeCompare(b.firstName),

            sortDirections: ['ascend', 'descend', 'ascend'],
            showSorterTooltip: false,

            width: 300,
            
        },
        {
            title: 'Cédula',
            dataIndex: 'dni',
            key: 'dni',

            render: (text: string, record: Person) =>
                (<Link to={`/contacts/${record.id}`}>{text}</Link>),

            sortDirections: ['ascend', 'descend', 'ascend'],
            showSorterTooltip: false,
            sorter: (a: Person, b: Person) => a.dni?.localeCompare(b.dni),

            
            width: 300
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,
            sorter: (a: Person, b: Person) => a.phone?.localeCompare(b.phone),
            width: 300
        },
        {
            title: 'Correo',
            dataIndex: 'email',
            key: 'email',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,
            sorter: (a: Person, b: Person) => a.email?.localeCompare(b.email),
            width: 300
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
            </Flex>,
            width: 300
        }

    ]
    return (
        <Card>
            <Flex gap={'middle'} align='center' justify='space-between'>
                <Typography.Title>
                    Contactos
                </Typography.Title>
                <Button onClick={() => navigate("new")}>
                    Nuevo
                </Button>
            </Flex>
            
            <Form form={form}>
                <Form.Item name='search'>
                    <Input placeholder='Buscar por nombre o cédula' prefix={<SearchOutlined />} />
                </Form.Item>
            </Form>

            <Table 
                rowKey="id"
                virtual
                dataSource={filteredContacts}
                columns={columns}
            />
        </Card>
    )
}