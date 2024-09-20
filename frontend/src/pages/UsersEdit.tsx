import React, { useState } from 'react';
import { Form, Input, Select, Button, Flex, Card, Typography, Divider } from 'antd';
import { useParams } from 'react-router-dom';


const selectOptionsRole = [
    { value: 'admin', label: 'Administrador' },
    { value: 'recaudador', label: 'Recaudador' },
    { value: 'coordinador', label: 'Coordinador' },
    { value: 'liquidador', label: 'Liquidador' },
    { value: 'fiscal', label: 'Fiscal' },
];

const selectOptionsContact = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
];

function UserEditForm() {
    const { userId } = useParams()
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [contact, setContact] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const isEditing = userId !== undefined

    const [changePassword, setChangePassword] = useState(false);
    const toggleChangePassword = () => setChangePassword(!changePassword);

    const handleSubmit = (values) => {
        // Handle form submission with values
    };

    

    return (
        <Flex vertical>
            <Card title={
                <Typography.Title>{isEditing ? "Editando Usuario" : "Registrando Usuario"}</Typography.Title>
            }>
                <Form onFinish={handleSubmit}>
                    <Form.Item label="Username">
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Email">
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Rol">
                        <Select  options={selectOptionsRole} />
                    </Form.Item>
                    <Form.Item label="Contacto">
                        <Select  options={selectOptionsContact} />
                    </Form.Item>

                    {isEditing && (
                        <ChangePasswordToggle
                            changePassword={changePassword}
                            toggleChangePassword={toggleChangePassword}
                        />
                    )}

                    {!isEditing && (
                        <Form.Item label="Password">
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Actualizar</Button>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    );
}

const ChangePasswordToggle = ({ changePassword, toggleChangePassword, newPassword, setNewPassword }) => {
    return (
        <Flex gap={10} style={{ marginBottom: '10px' }}>
            <Button onClick={toggleChangePassword}>
                Cambiar Contraseña
            </Button>

            {changePassword && (
                <Form.Item label="Nueva contraseña">
                    <Input.Password />
                </Form.Item>
            )}
        </Flex>
    );
};

export default UserEditForm;