import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Button, Typography, Card, Flex, Checkbox, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

import dayjs from 'dayjs';

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

    // i should get the list of branch offices for a business 
    // with that list, i will generate a list of options for the branch office select

    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);

    useEffect(() => {
        loadBranchOffices();
    }, []);

    async function loadBranchOffices() {
        // Dummy data for branch offices
        const dummyBranchOffices: BranchOffice[] = [
            { id: 1, nickname: "Sucursal Principal", address: "Av. Libertador 123", shouldChargeWasteCollection: true },
            { id: 2, nickname: "Sucursal Centro", address: "Calle Bolívar 456", shouldChargeWasteCollection: false },
            { id: 3, nickname: "Sucursal Norte", address: "Av. Miranda 789", shouldChargeWasteCollection: true },
            { id: 4, nickname: "Sucursal Sur", address: "Calle Sucre 101", shouldChargeWasteCollection: false },
            { id: 5, nickname: "Sucursal Este", address: "Av. Francisco de Miranda 202", shouldChargeWasteCollection: true },
        ];

        // Set the branch offices state with dummy data
        setBranchOffices(dummyBranchOffices);
    }

    useEffect(() => {
        // update default values for branch office select 
        const firstOffice = branchOffices[0];

        if (firstOffice) {
            form.setFieldsValue({
                branchOffice: firstOffice.nickname + ' - ' + firstOffice.address,
                chargeWasteCollection: firstOffice.shouldChargeWasteCollection
            });
        }
    }, [branchOffices]);

    // Update the Select component to use the branchOffices state
    const branchOfficeOptions = branchOffices.map(office => ({
        key: office.id,
        value: `${office.nickname} - ${office.address}`,
        label: `${office.nickname} - ${office.address}`
    }));

    return (
        <Card title={<Title level={2}>Registrando Ingresos Brutos</Title>}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    period: dayjs().subtract(1, 'month'),
                    amount: 0
                }}
            >
                <Form.Item
                    layout='horizontal'
                    name="branchOffice"
                    label="Sucursal"
                    rules={[{ required: true, message: 'Por favor seleccione la sucursal' }]}
                >
                    <Select
                        options={branchOfficeOptions}
                        showSearch
                        onChange={ (value) => {
                            // Get the selected branch office
                            const selectedBranchOffice = branchOffices.find(office => `${office.nickname} - ${office.address}` === value);
                            
                            // Update shouldChargeWasteCollection in form
                            if (selectedBranchOffice) {
                                form.setFieldsValue({
                                    chargeWasteCollection: selectedBranchOffice.shouldChargeWasteCollection
                                });
                            } else {
                                // If there's an error or no branch office found, set to false
                                form.setFieldsValue({
                                    chargeWasteCollection: false
                                });
                            }
                        }}
                    />
                </Form.Item>

                <Flex wrap gap={16} align='center'>
                    <Form.Item
                        layout='horizontal'
                        name="period"
                        label="Periodo"
                        rules={[{ required: true, message: 'Por favor ingrese el periodo' }]}
                    >
                        <DatePicker picker="month"/>
                    </Form.Item>

                    <Form.Item
                        layout='horizontal'
                        name="amount"
                        label="Ingreso Bruto"
                        rules={[{ required: true, message: 'Por favor ingrese el ingreso bruto' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            addonAfter='Bs'
                            min='0'
                            step='0.01'
                            />
                    </Form.Item>

                        <Form.Item
                            name="chargeWasteCollection"
                            valuePropName="checked"
                        >
                            <Checkbox>¿Cobrar Aseo Urbano?</Checkbox>
                        </Form.Item>
                </Flex>

                <Form.Item
                    name="declaratinoImage"
                >
                    <Upload><Button>Subir Declaración</Button></Upload>
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
