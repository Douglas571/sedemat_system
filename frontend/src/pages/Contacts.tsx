import {useState, useEffect} from 'react'

import { Form, Input, Button, message, Typography, Select, Flex, Image, Table} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'

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

            // setContacts([
            //     {
            //         id: 1,
            //         firstName: "Douglas",
            //         lastName: "Socorro",
            //         dni: "29748656",
            //         phone: "04125340038",
            //         whatsapp: "04125340038",
            //         email: "douglassocorro1@gmail.com",
        
            //         get fullName(): string{
            //             return this.firstName + " " + this.lastName
            //         }
            //     },
            //     {
            //         id: 2,
            //         firstName: "Juan",
            //         lastName: "Socorro",
            //         dni: "29748656",
            //         phone: "04125340038",
            //         whatsapp: "04125340038",
            //         email: "douglassocorro1@gmail.com",
        
            //         get fullName(): string{
            //             return this.firstName + " " + this.lastName
            //         }
            //     },
            //     {
            //         id: 3,
            //         firstName: "Carlos",
            //         lastName: "Socorro",
            //         dni: "29748656",
            //         phone: "04125340038",
            //         whatsapp: "04125340038",
            //         email: "douglassocorro1@gmail.com",
                    
            //         get fullName(): string{
            //             return this.firstName + " " + this.lastName
            //         }
            //     },
        
            // ])

        } catch(error) {
            console.error({error})
        }
    }


    const columns = [
        {
            title: 'Nombre y Apellido',
            dataIndex: 'fullName',
            key: 'fullName',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            render: (text: string, record: Person) => <Link to={`/contacts/${record.id}`}>{record.firstName + " " + record.lastName}</Link>,
            sorter: (a: Person, b: Person) => a.firstName?.localeCompare(b.firstName),
        },
        {
            title: 'Cédula',
            dataIndex: 'dni',
            key: 'dni',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            // render: (text: string, record: Contact) => <Link to={`/contacts/${record.id}`}>{text}</Link>,
            sorter: (a: Person, b: Person) => a.dni?.localeCompare(b.dni),
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
            <Typography.Title>
                Contactos
            </Typography.Title>
            <Button onClick={() => navigate("new")}>
                Nuevo
            </Button>
            
            <Table 
                dataSource={contacts.map(r => ({...r, key: r.id}))}
                columns={columns}
            />

        </>
    )
}