import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, DatePicker, Flex, Form, Input, InputNumber, message, Select, Typography, Upload } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { UploadProps } from 'antd';

import * as api from '../util/api';
import * as grossIncomeApi from '../util/grossIncomeApi';
import currencyExchangeRatesService from '../services/CurrencyExchangeRatesService';
import { BranchOffice, Business, IGrossIncome } from '../util/types';
import { completeUrl } from './BusinessShared';

const { Title } = Typography;
const { Option } = Select;

const TaxCollectionBusinessGrossIncomesEdit: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { businessId, grossIncomeId } = useParams();
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [grossIncome, setGrossIncome] = useState<IGrossIncome>();
    const [business, setBusiness] = useState<Business>();
    const hasBranchOffices = branchOffices?.length > 0;

    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()

    const isEditing = grossIncomeId !== undefined;

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const branchOfficeOptions = branchOffices?.map(office => ({
        key: office.id,
        value: office.id,
        label: `${office.nickname} - ${office.address}`
    }));

    const branchOfficeId = Form.useWatch('branchOffice', form)

    useEffect(() => {
        // console.log('businessId:', businessId);
        // console.log('grossIncomeId:', grossIncomeId);
            
        if (businessId) {  
            loadBusiness();
            loadBranchOffices();
        }

        if (grossIncomeId) {
            loadGrossIncome();
        }

        loadLastCurrencyExchangeRate()

    }, [businessId, grossIncomeId]);

    useEffect(() => {
        // update default values for branch office select 

        if (!grossIncomeId && branchOffices?.length > 0) {
            const firstOffice = branchOffices[0];
    
            if (firstOffice) {
                console.log('firstOffice', firstOffice)
                form.setFieldsValue({
                    branchOffice: branchOffices[0].id
                })
            }
        }

        
    }, [branchOffices]);

    useEffect(() => {
        // update the value from chargeWasteCollection
        console.log('branchOfficeId in useEffect', branchOfficeId)
        const selectedBranchOffice = branchOffices.find(office => office.id === branchOfficeId)
        console.log('selectedBranchOffice', selectedBranchOffice)

        form.setFieldsValue({
            chargeWasteCollection: selectedBranchOffice?.chargeWasteCollection
        })
    }, [branchOfficeId])

    useEffect(() => {
        // Update form with fetched gross income data
        if(grossIncome) {
            // console.log('grossIncome', grossIncome)
            form.setFieldsValue({
                period: dayjs(grossIncome.period),
                amountBs: grossIncome.amountBs,
                chargeWasteCollection: grossIncome.chargeWasteCollection,
                branchOffice: grossIncome.branchOffice.id
            });

            const imageUrl = completeUrl(grossIncome.declarationImage)
            
            fetch(imageUrl)
                .then(response => response.blob())
                .then(imageBlob => {
                    const imageFile = new File([imageBlob], 'image.jpg', { type: imageBlob.type })

                    const uploadFile = {
                        uid: '-1',
                        name: 'image.jpg',
                        status: 'done',
                        url: imageUrl,
                        originFileObj: imageFile,
                    } as UploadFile;
                    
                    setFileList([uploadFile]);

                    form.setFieldsValue({
                        declarationImage: uploadFile
                    })
                })
                .catch(error => {
                    console.error('Error fetching image:', error);
                });
        }
    }, [grossIncome]);

    async function loadLastCurrencyExchangeRate() {
        const lastCurrencyExchangeRate = await currencyExchangeRatesService.getLastOne()
        console.log({lastCurrencyExchangeRate})
        setLastCurrencyExchangeRate(lastCurrencyExchangeRate)
    }

    async function loadBusiness() {
        // Dummy data for branch offices
        let fetchedBusiness: Business

        fetchedBusiness = await api.fetchBusinessById(Number(businessId));
        setBusiness(fetchedBusiness);
    }

    async function loadBranchOffices() {
        let fetchedBranchOffices: BranchOffice[]

        fetchedBranchOffices = await api.fetchBranchOffices(Number(businessId))
        setBranchOffices(fetchedBranchOffices);
    }

    async function loadGrossIncome() {
        const fetchedGrossIncome: IGrossIncome = await grossIncomeApi.getGrossIncomeById(Number(grossIncomeId));


        // console.log('Loaded gross income:', fetchedGrossIncome);
        setGrossIncome(fetchedGrossIncome);
    }

    async function handleChange({ fileList: newFileList }: { fileList: UploadFile[] }) {
        console.log('newFileList', newFileList)
        setFileList(newFileList); // Only keep the last uploaded file
    };

    async function onFinish(values: any) {

        console.log('Form values:', values);

        try {
            let declarationImageUrl = null;

            if (!values.declarationImage) {
                message.error('Por favor suba la declaración');
                return false;
            }

            // if there is no new files, values.declarationImage will be undefined
            if (values.declarationImage.uid === '-1') {
                console.log('no new files')
                declarationImageUrl = grossIncome?.declarationImage;
            } else {
                // otherwise, values.declarationImage will be the file object, in this case, should update the image
                const file = values.declarationImage.file
                
                try {
                    declarationImageUrl = await grossIncomeApi.uploadDeclarationImage(file);
                    
                } catch (error) {
                    console.error('Error uploading declaration image:', error);
                    message.error('Error al subir la imagen de declaración. Por favor, intente nuevamente.');
                    return false;
                }
            }

            console.log('lastCurrencyExchangeRate', lastCurrencyExchangeRate)
            const newGrossIncome: IGrossIncome = {
                ...grossIncome,
                ...values,
                period: values.period.format('YYYY-MM-DD'),
                businessId: Number(businessId),
                branchOfficeId: branchOfficeId,
                declarationImage: declarationImageUrl,
            };

            // if is editing, update the gross income
            if (isEditing) {
                const updatedGrossIncome = await grossIncomeApi.updateGrossIncome(newGrossIncome);
                message.success('Ingreso bruto actualizado exitosamente');
            } else {
                newGrossIncome.currencyExchangeRatesId = lastCurrencyExchangeRate?.id
                const registeredGrossIncome = await grossIncomeApi.registerGrossIncome(newGrossIncome);
                message.success('Ingreso bruto registrado exitosamente');
            }

            navigate(-1);
            
        } catch (error) {
            console.error('Error al registrar ingreso bruto:', error);
            message.error('Error al registrar ingreso bruto. Por favor, intente nuevamente.');
        }
    };

    const uploadProps: UploadProps = {
        onPreview: async (file: UploadFile) => {
            
        },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList)
        },
        beforeUpload: (file) => {
			console.log("adding files")
			setFileList([...fileList, file]);
			return false;
		},
		fileList,
        maxCount: 1
    }

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
                        placeholder='Seleccione la sucursal'
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

                
                <Form.Item
                    name="declarationImage"
                    label="Declaración"
                    rules={[{ required: true, message: 'Por favor suba la declaración' }]}
                >
                    <Upload
                        {...uploadProps}
                    >
                        <Button icon={<UploadOutlined />}>Subir Declaración</Button>
                    </Upload>
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




const DeclarationImageUpload: React.FC<{initialFileList: UploadFile[]}> = ({initialFileList}) => {
    const [fileList, setFileList] = useState<UploadFile[]>(initialFileList);

    const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        console.log('newFileList', newFileList)
        setFileList([...newFileList]); // Only keep the last uploaded file
    };

    useEffect(() => {
        console.log('setting initialFileList', initialFileList)
        setFileList([...initialFileList]);
    }, [initialFileList]);

    // const uploadProps: UploadProps = {
	// 	onRemove: (file) => {
	// 		const index = fileList.indexOf(file);
	// 		const newFileList = fileList.slice();
	// 		newFileList.splice(index, 1);
	// 		setFileList(newFileList);
	// 	},
	// 	beforeUpload: (file) => {
	// 		console.log("adding files")
	// 		setFileList([...fileList, file]);

	// 		return false;
	// 	},
	// 	onChange: ({ fileList: newFileList }) => {
	// 		setFileList(newFileList)
	// 	},
	// 	fileList,
	// 	maxCount: 1
	// }

    return (
        <Upload></Upload>
    );
};
