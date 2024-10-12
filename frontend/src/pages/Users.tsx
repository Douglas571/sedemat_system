import { Typography, Flex, Table, Card, Button, Popconfirm, message} from 'antd';
import { PlusOutlined } from '@ant-design/icons'; // Updated import for PlusOutlined

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IUser, Person } from '../util/types';
import userService from 'services/UserService';

import useAuthentication from '../hooks/useAuthentication';


const Users: React.FC = () => {
    const navigate = useNavigate()

    const [users, setUsers] = useState<IUser[]>()
    const { userAuth } = useAuthentication()

    const handleDelete = async (id: number) => {
        // call api to delete user
        try {
            await userService.delete(id, userAuth?.token)
        } catch (error) {
            console.error({error})
            message.error(error.message)
        }

        loadData()
    }
    
    const loadData = async () => {
        let users = await userService.findAll()
        setUsers(users)

        console.log({users})	
    }
    // add a useeffect to load users 
    useEffect(() => {
        loadData()
    }, [])


    const columns = [
        {
            title: 'Nombre de Usuario',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Contacto',
            dataIndex: 'person',
            key: 'contact',
            render: (person: Person) => {
                if (!person) {
                    return 'Sin contacto'
                }
                return <Link to={`/contacts/${person.id}`}>{person.firstName} {person.lastName}</Link>
            }
        },
        {
            title: 'Correo',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: "Rol",
            dataIndex: "role",
            key: 'role',
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_: any, record: IUser) => (
                <Flex gap={10}>
                    <Button onClick={() => navigate(`${record.id}/edit`)}>Editar</Button>
                    <Popconfirm
                        title="¿Estás seguro de que quieres eliminar este usuario?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger>Eliminar</Button>
                    </Popconfirm>
                </Flex>
            ),
        },
    ];

    return (
        <Flex vertical>
            <Card title={
                <Flex align='center' justify='space-between'>
                    <Typography.Title level={3}>Usuarios</Typography.Title>
                    <Button  onClick={() => navigate('/users/new')} icon={<PlusOutlined />}>Agregar</Button>
                </Flex>}
            >
                <Table dataSource={users} columns={columns} />
            </Card>
        </Flex>
    );
};

export default Users;