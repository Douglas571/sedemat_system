import { Typography, Flex, Table, Card, Button, Popconfirm} from 'antd';
import { PlusOutlined } from '@ant-design/icons'; // Updated import for PlusOutlined

import React from 'react';
import { useNavigate } from 'react-router-dom';


const Users: React.FC = () => {
    const navigate = useNavigate()

    const handleDelete = async (id: number) => {
        // call api to delete user
    }

    // add a useeffect to load users 

    const columns = [
        {
            title: 'Nombre de Usuario',
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: 'Contacto',
            dataIndex: 'contact',
            key: 'contact',
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

    const dataSource: IUsers[] = [
        { id: 1, nickname: 'John Doe', contact: 'john.doe@example.com', email: 'john.doe@example.com' }]

    return (
        <Flex vertical>
            <Card title={
                <Flex align='center' justify='space-between'>
                    <Typography.Title level={3}>Usuarios</Typography.Title>
                    <Button  onClick={() => navigate('/users/new')} icon={<PlusOutlined />}>Agregar</Button>
                </Flex>}
            >
                <Table dataSource={dataSource} columns={columns} />
            </Card>
        </Flex>
    );
};

export default Users;