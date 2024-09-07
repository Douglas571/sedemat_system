import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const TaxCollectionBusinessGrossIncomesEdit: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const monthMapper: { [key: number]: string } = {
        1: "Enero",
        2: "Febrero",
        3: "Marzo",
        4: "Abril",
        5: "Mayo",
        6: "Junio",
        7: "Julio",
        8: "Agosto",
        9: "Septiembre",
        10: "Octubre",
        11: "Noviembre",
        12: "Diciembre"
    };

    const onFinish = (values: any) => {
        console.log('Form values:', values);
        // Here you would typically send the data to your API
        // After successful submission, navigate back to the main page
        navigate(-1);
    };

    return (
        <Card title={<Title level={2}>Agregar Ingreso Bruto</Title>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="year"
                    label="Año"
                    rules={[{ required: true, message: 'Por favor ingrese el año' }]}
                >
                    <DatePicker picker="year" />
                </Form.Item>

                <Form.Item
                    name="month"
                    label="Mes"
                    rules={[{ required: true, message: 'Por favor seleccione el mes' }]}
                >
                    <Select>
                        {Object.entries(monthMapper).map(([key, value]) => (
                            <Option key={key} value={Number(key)}>{value}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="grossIncome"
                    label="Ingreso Bruto"
                    rules={[{ required: true, message: 'Por favor ingrese el ingreso bruto' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        prefix="Bs."
                    />
                </Form.Item>

                <Form.Item
                    name="branchOffice"
                    label="Sucursal"
                    rules={[{ required: true, message: 'Por favor seleccione la sucursal' }]}
                >
                    <Select>
                        <Option value="1">Sucursal Principal</Option>
                        {/* Add more options as needed */}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Guardar
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default TaxCollectionBusinessGrossIncomesEdit;
