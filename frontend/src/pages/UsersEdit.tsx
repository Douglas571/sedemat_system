import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Flex, Card, Typography, Divider } from 'antd';
import { useParams } from 'react-router-dom';

import { useForm } from 'antd/es/form/Form';
import { IRole, IUser, Person } from '../util/types';

import userService from '../services/UserService';
import peopleService from '../util/people'
import authService from 'services/authService';




function UserEditForm() {
    const { userId } = useParams()
    const [form] = Form.useForm();

    const [user, setUser] = useState<IUser>();
    const [contacts, setContacts] = useState<Person[]>()
    const [roles, setRoles] = useState<IRole[]>()

    const [changePassword, setChangePassword] = useState(false);

    const isEditing = userId !== undefined    
    let selectOptionsContact: { key: number, label: string, value: number }[] = contacts?.map( contact => ({
        key: contact.id || 0,
        label: `${contact.dni} - ${contact.firstName} ${contact.lastName}`,
        value: contact.id || 0
    })) || []

    let selectOptionsRole: { key: number, label: string, value: number }[] = roles?.map( role => {
        return {
            key: role.id,
            label: role.name,
            value: role.id
        }
    }) || []

    const toggleChangePassword = () => setChangePassword(!changePassword);

    const loadData = async () => {
        let user = await userService.findById(Number(userId))
        setUser(user)

        let contacts = await peopleService.fetchAll()
        setContacts(contacts)

        let roles = await authService.getRoles()
        setRoles(roles)
    }

    const updateUser = async (user: IUser) => {
        try {
            const newUser = await userService.update(Number(userId), user)

            console.log({newUser})
        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmit = (values) => {
        // Handle form submission with values

        console.log({values})
        let updateUserData: IUser = {
            ...values, 
            password: changePassword ? values.password : undefined
        }
        updateUser(updateUserData)
    };

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        form.setFieldsValue({
            ...user,
            role: user?.role.name
        })
    }, [user])

    return (
        <Flex vertical>
            <Card title={
                <Typography.Title>{isEditing ? "Editando Usuario" : "Registrando Usuario"}</Typography.Title>
            }>
                <Form 
                    form={form}
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Username" name='username'>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Email" name='email'>
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item label="Rol" name='roleId'>
                        <Select  options={selectOptionsRole} />
                    </Form.Item>
                    <Form.Item label="Contacto" name='personId'>
                        <Select  showSearch filterOption={(value, option) => option?.label.toLocaleLowerCase().includes(value.toLowerCase()) || false} options={selectOptionsContact} />
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

interface ChangePasswordProps {
    changePassword: boolean,
    toggleChangePassword: () => void
}
const ChangePasswordToggle = ({ changePassword, toggleChangePassword }: ChangePasswordProps) => {
    return (
        <Flex gap={10} style={{ marginBottom: '10px' }}>
            <Button onClick={toggleChangePassword}>
                Cambiar Contraseña
            </Button>

            {changePassword && (
                <Form.Item label="Nueva contraseña" name='password'>
                    <Input.Password />
                </Form.Item>
            )}
        </Flex>
    );
};

export default UserEditForm;