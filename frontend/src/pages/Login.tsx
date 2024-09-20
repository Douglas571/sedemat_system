import React, { useEffect } from 'react';
import { Form, Input, Button, Flex, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    let navigate = useNavigate()
    const onFinish = (values) => {
        console.log('Received values:', values);
    };

    let existsAdmin = true 

    useEffect(() => {
        if (!existsAdmin) {
            navigate('/singup')
        }
    }, [existsAdmin])

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
                        name="nickname"
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
    );
};

export default LoginForm;