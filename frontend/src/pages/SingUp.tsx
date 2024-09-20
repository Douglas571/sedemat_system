import React from 'react';
import { Form, Input, Button, Flex, Card, Typography } from 'antd';

const SignUpForm = () => {
    const onFinish = (values) => {
        console.log('Received values:', values);
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
                        name="nickname"
                        rules={[{ required: true, message: 'Por favor ingresa tu nickname!' }]}
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