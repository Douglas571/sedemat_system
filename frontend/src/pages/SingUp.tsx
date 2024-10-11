import React from 'react';
import { Form, Input, Button, Flex, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import useAuthentication from '../hooks/useAuthentication';

import authService from '../services/authService';

const SignUpForm = () => {
    const { userAuth, setUserAuth } = useAuthentication()
    const navigate = useNavigate()

    const onFinish = async (values) => {
        console.log('Received values:', values);

        // call function to singup admin
        try {
            let response = await authService.singupAdmin(values)

            if (!response) {
                throw new Error('Problemas del servidor, intenta de nuevo')
            }

            let {user, token} = response
            console.log({user, token})

            // authService.singupAdmin(values)


            // else, setup the auth token and user 
                // navigate to dashboard 
            setUserAuth({token, user})
            navigate('/')


        } catch (error) {
            message.error(error.message)

        }
        
        // if error, show error with message
    };

    return (
        <Flex vertical
            align='center'
            justify='center'
            style={{
                height: "100vh",
                background: '#999999'
            }}
        >
            <Card 
                title={<Flex>
                <Typography.Title>Registrar Administrador</Typography.Title>
                </Flex>}

                style={{
                    maxWidth: 600
                }}
            >
                <Form
                    name="signup"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Nombre de Usuario"
                        name="username"
                        rules={[{ required: true, message: 'Por favor ingresa tu nombre de usuario!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Por favor ingresa un email válido!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Por favor ingresa tu contraseña!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Flex justify='center'>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Registrarse
                            </Button>
                        </Form.Item>
                    </Flex> 
                    
                </Form>
            </Card>
        </Flex>
    );
};

export default SignUpForm;