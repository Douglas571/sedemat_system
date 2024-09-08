import React, { useState, useEffect } from 'react';

import { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, DatePicker, InputNumber, Select, Button, Typography, Card, Flex, Checkbox, Upload, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import { BranchOffice, Business, IGrossIncome } from '../util/types';
import * as api from '../util/api';
import * as grossIncomeApi from '../util/grossIncomeApi';

const { Title } = Typography;
const { Option } = Select;

import dayjs from 'dayjs';

const TaxCollectionBusinessGrossIncomesEdit: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { businessId, grossIncomeId } = useParams();
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [business, setBusiness] = useState<Business>();
    const hasBranchOffices = branchOffices?.length > 0;

    useEffect(() => {
        if (businessId) {
            console.log('businessId:', businessId);
            

            loadBusiness();
        }

        if (grossIncomeId) {
            loadGrossIncome();
            console.log('grossIncomeId:', grossIncomeId);
        }

    }, [businessId, grossIncomeId]);

    async function loadBusiness() {
        // Dummy data for branch offices
        let fetchedBusiness: Business
        let fetchedBranchOffices: BranchOffice[]

        fetchedBusiness = await api.fetchBusinessById(Number(businessId));
        setBusiness(fetchedBusiness);

        fetchedBranchOffices = await api.fetchBranchOffices(Number(businessId))
        setBranchOffices(fetchedBranchOffices);
    }

    async function loadGrossIncome() {
    // Dummy data for a gross income
        const dummyGrossIncome: IGrossIncome = {
            id: Number(grossIncomeId),
            businessId: Number(businessId),
            branchOfficeId: 1,
            period: '2023-07',
            amountBs: 50000,
            chargeWasteCollection: true,
            declarationImage: 'https://example.com/dummy-image.jpg'
        };

        // Set the form values with the dummy data
        form.setFieldsValue({
            branchOffice: `${branchOffices.find(office => office.id === dummyGrossIncome.branchOfficeId)?.nickname} - ${branchOffices.find(office => office.id === dummyGrossIncome.branchOfficeId)?.address}`,
            period: dayjs(dummyGrossIncome.period),
            amount: dummyGrossIncome.amountBs,
            chargeWasteCollection: dummyGrossIncome.chargeWasteCollection,
            declarationImage: dummyGrossIncome.declarationImage
        });

        console.log('Loaded gross income:', dummyGrossIncome);
    }

    const onFinish = async (values: any) => {
        console.log('Form values:', values);
        console.log('date', values.period.toJSON());

        try {
            // Upload declaration image if provided
            let declarationImageUrl = null;
            if (values.declarationImage) {
                try {
                    declarationImageUrl = await grossIncomeApi.uploadDeclarationImage(values.declarationImage.file);
                    
                } catch (error) {
                    console.error('Error uploading declaration image:', error);
                    message.error('Error al subir la imagen de declaración. Por favor, intente nuevamente.');
                    return;
                }
            }

            const grossIncome: IGrossIncome = {
                ...values,
                period: values.period.format('YYYY-MM-DD'),
                businessId: Number(businessId),
                branchOfficeId: branchOffices.find(office => `${office.nickname} - ${office.address}` === values.branchOffice)?.id,
                declarationImage: declarationImageUrl
            };

            const newGrossIncome = await grossIncomeApi.registerGrossIncome(grossIncome);
            console.log('newGrossIncome', JSON.stringify(newGrossIncome, null, 2));
            message.success('Ingreso bruto registrado exitosamente');


            navigate(-1);
        } catch (error) {
            console.error('Error al registrar ingreso bruto:', error);
            message.error('Error al registrar ingreso bruto. Por favor, intente nuevamente.');
        }
    };

    useEffect(() => {
        // update default values for branch office select 

        if (branchOffices?.length > 0) {
            const firstOffice = branchOffices[0];

            if (firstOffice) {
                console.log('firstOffice', firstOffice)
                form.setFieldsValue({
                    branchOffice: firstOffice.nickname + ' - ' + firstOffice.address,
                    chargeWasteCollection: firstOffice?.chargeWasteCollection
                });
            }
        }

        
    }, [branchOffices]);

    // Update the Select component to use the branchOffices state
    const branchOfficeOptions = branchOffices?.map(office => ({
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
                    rules={[{ required: hasBranchOffices, message: 'Por favor seleccione la sucursal' }]}
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
                        name="amountBs"
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

                
                <DeclarationImageUpload />
                
                    

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




const DeclarationImageUpload: React.FC = () => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileList(newFileList.slice(-1)); // Only keep the last uploaded file
    };

    return (
        <Form.Item
            name="declarationImage"
            label="Declaración"
            rules={[{ required: true, message: 'Por favor suba la declaración' }]}
        >
            <Upload
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={() => false} // Prevent auto upload
                maxCount={1}
            >
                <Button icon={<UploadOutlined />}>Subir Declaración</Button>
            </Upload>
        </Form.Item>
    );
};
