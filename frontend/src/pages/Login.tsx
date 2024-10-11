import React, { useEffect } from 'react';
import { Form, Input, Button, Flex, Card, Typography, message} from 'antd';
import { useNavigate } from 'react-router-dom';

import useAuthentication from 'hooks/useAuthentication';

import authService from '../services/authService';

const LoginForm = () => {
    let navigate = useNavigate()

    const { userAuth, setUserAuth } = useAuthentication()

    let [messageApi, contextHolder] = message.useMessage()

    let existsAdmin = true 


    // function to check if user exists 


    const onFinish = async (values) => {
        console.log('Received values:', values);

        const userCredentials = {
            username: values.username,
            password: values.password
        }

        // call function to authService.login

        try {
            const data = await authService.login(userCredentials)

            console.log({data})

            if (data) {
                setUserAuth(data)
                navigate('/')
            }

        } catch (error) {
            if (error instanceof Error) {
                console.log({error})
                messageApi.error(error.message)
            }
        }

        // if error, show error with message 

    };


    const checkIfExistsAdmin = async () => {
        try {
            let existsAdmin = await authService.existsAdmin()
            console.log({existsAdmin})
            if (!existsAdmin) {
                navigate('/singup')
            }
        } catch (error) {
            console.log({error})
            messageApi.error(error.message)
        }
    }

    useEffect(() => {
        // check if admin exists 
        checkIfExistsAdmin()
    }, [])

    useEffect(() => {
        if (userAuth.token) {
            navigate('/')
        }
    }, [userAuth])


    useEffect(() => {
        if (!existsAdmin) {
            navigate('/singup')
        }
    }, [existsAdmin])

    return (
        <>
            {contextHolder}
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
                    <Typography.Title>Iniciar Sesión</Typography.Title>
                    </Flex>}

                    style={{
                        
                        maxWidth: 600
                    }}
                >
                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            label="Nombre de Usuario"
                            name="username"
                            rules={[{ required: true, message: 'Por favor ingresa tu nickname!' }]}
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
                                    Iniciar Sesión
                                </Button>
                            </Form.Item>
                        </Flex> 
                        
                    </Form>
                </Card>
            </Flex>
        </>
    );
};

export default LoginForm;