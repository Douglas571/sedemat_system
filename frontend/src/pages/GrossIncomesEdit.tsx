import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, DatePicker, Flex, Form, Input, InputNumber, message, Select, Typography, Upload } from 'antd';

import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';

import * as api from '../util/api';
import * as grossIncomeApi from '../util/grossIncomeApi';
import alicuotaService from '../services/alicuotaService';
import currencyExchangeRatesService from '../services/CurrencyExchangeRatesService';
import economicActivitiesService from '../services/EconomicActivitiesService';

import * as util from '../util';

import type { BranchOffice, Business, IGrossIncome, EconomicActivity, CurrencyExchangeRate, IAlicuota } from '../util/types';
import { completeUrl } from './BusinessShared';
import { percentHandler } from 'util/currency';

const { Title } = Typography;
// const { Option } = Select;

const TaxCollectionBusinessGrossIncomesEdit: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { businessId, grossIncomeId } = useParams();
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [grossIncome, setGrossIncome] = useState<IGrossIncome>();
    const [business, setBusiness] = useState<Business>();
    const [economicActivity, setEconomicActivity] = useState<EconomicActivity>();

    

    // a variable for storing all currency exchange rates 
    const [alicuotaHistory, setAlicuotaHistory] = useState<IAlicuota[]>([]);

    // a variable for storing all alicuotas related to the economic activity of the business
    const [currencyExchangeRateHistory, setCurrencyExchangeRateHistory] = useState<CurrencyExchangeRate[]>([]);

    const alicuotaHistoryOptions = alicuotaHistory
        ?.sort((a, b) => dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1)
        ?.map(a => ({
            key: a.id,
            value: a.id,
            label: `${dayjs(a.createdAt).format('DD/MM/YYYY')} - ${a.taxPercent * 100}%`
        }));

    const currencyExchangeRateOptions = currencyExchangeRateHistory
        ?.sort((a, b) => dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1)
        ?.map(c => {
            const MMVtoBsExchangeRate = util.getMMVExchangeRate(c);
            return {
                key: c.id,
                value: c.id,
                label: `${dayjs(c.createdAt).format('DD/MM/YYYY')} - ${MMVtoBsExchangeRate} Bs.`
            }
        });

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
    const selectedBranchOffice = branchOffices?.find(office => office.id === branchOfficeId)

    const selectedAlicuotaId = Form.useWatch('alicuotaId', form)
    const selectedAlicuota = alicuotaHistory?.find(alicuota => alicuota.id === selectedAlicuotaId)

    const chargeWasteCollectionTax = Form.useWatch('chargeWasteCollection', form)

    // TODO
    // i will load the alicuota history after getting the economic activity id 

    // i will load the currency exchange rate history at the beginnign of the page


    /* load 
        business, 
        branch offices
        gross incomes data if it exists
        currency exchange rate
    */

    async function loadData() {
        if (businessId) {
            await loadBusiness();
            await loadBranchOffices();
        }

        if (grossIncomeId) {
            await loadGrossIncome();
        }
    }

    useEffect(() => {
        loadLastCurrencyExchangeRate()
        loadLastCurrencyExchangeRateHistory()

        loadData()
    }, []);

    useEffect(() => {
        if (lastCurrencyExchangeRate) {
            form.setFieldsValue({
                currencyExchangeRatesId: lastCurrencyExchangeRate.id,
                TCMMVBCV: util.getMMVExchangeRate(lastCurrencyExchangeRate)
            })
        }
    }, [lastCurrencyExchangeRate])

    

    // load economic activity with current alicuota
    useEffect(() => {
        loadEconomicActivity();
    }, [business]);

    useEffect(() => {
        // update default values for branch office select 
        if (!isEditing && branchOffices?.length > 0) {
            const firstOffice = branchOffices[0];
    
            if (firstOffice) {
                console.log('firstOffice', firstOffice)
                form.setFieldsValue({
                    branchOffice: branchOffices[0].id,
                    chargeWasteCollection: branchOffices[0]?.chargeWasteCollection
                })
            }
        }
        
    }, [branchOffices]);

    // update the value from chargeWasteCollection
    useEffect(() => {
        // console.log('branchOfficeId in useEffect', branchOfficeId)
        if (!isEditing && branchOfficeId) {
            const selectedBranchOffice = branchOffices.find(office => office.id === branchOfficeId)
            // console.log('selectedBranchOffice', selectedBranchOffice)

            form.setFieldsValue({
                chargeWasteCollection: selectedBranchOffice?.chargeWasteCollection
            })
        }
    }, [branchOfficeId])

    // Update form with fetched gross income data
    useEffect(() => {
        if(grossIncome) {
            // console.log('grossIncome', grossIncome)
            form.setFieldsValue({
                ...grossIncome,
                period: dayjs(grossIncome.period),
                // TODO: Modify the branch office name 
                branchOffice: grossIncome.branchOfficeId,
                alicuotaId: grossIncome.alicuotaId,
                currencyExchangeRatesId: grossIncome.currencyExchangeRatesId,

                alicuotaTaxPercent: percentHandler(grossIncome.alicuotaTaxPercent).multiply(100).value,
            })

            if (grossIncome.declarationImage) {
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
                    })
            }

            console.log({grossIncome})
        }
    }, [grossIncome]);

    useEffect(() => {
        if (economicActivity) {
            loadAlicuotaHistory(economicActivity.id)
        }

        if (economicActivity && !grossIncome?.alicuotaId) {
            form.setFieldsValue({
                alicuotaId: economicActivity?.currentAlicuota?.id
            })
        }
    }, [economicActivity])

    function updateTCMMVBCV() {
        form.setFieldsValue({
            TCMMVBCV: util.getMMVExchangeRate(lastCurrencyExchangeRate)
        })
    }

    function updateAlicuota() {
        if (economicActivity?.currentAlicuota?.id !== selectedAlicuotaId) {
            form.setFieldsValue({
                alicuotaTaxPercent: percentHandler(selectedAlicuota?.taxPercent).multiply(100).value,
                alicuotaMinTaxMMVBCV: selectedAlicuota?.minTaxMMV
            })
        } else {
            
            form.setFieldsValue({
                alicuotaTaxPercent: percentHandler(economicActivity?.currentAlicuota?.taxPercent).multiply(100).value,
                alicuotaMinTaxMMVBCV: economicActivity?.currentAlicuota?.minTaxMMV
            })
        }
    }


    function updateWasteCollection() {

        
        if (grossIncome?.branchOffice?.dimensions) {
            form.setFieldsValue({
                branchOfficeDimensionsMts2: grossIncome?.branchOffice?.dimensions,
                branchOfficeType: grossIncome?.branchOffice?.type,
                wasteCollectionTaxMMVBCV: util.getWasteCollectionTaxInMMV(grossIncome?.branchOffice?.dimensions)
            })
        } else {
            form.setFieldsValue({
                branchOfficeDimensionsMts2: selectedBranchOffice?.dimensions,
                branchOfficeType: selectedBranchOffice?.type,
                wasteCollectionTaxMMVBCV: util.getWasteCollectionTaxInMMV(selectedBranchOffice?.dimensions)
            })
            // return message.warning('No se ha cargado la dimension de la sucursal')
        }

        
    }

    async function loadLastCurrencyExchangeRateHistory() {
        const cerHistory = await currencyExchangeRatesService.getAll()
        setCurrencyExchangeRateHistory(cerHistory)
    }

    async function loadAlicuotaHistory(economicActivityId: number) {
        const alicuotaHistory = await alicuotaService.findAll(
            {
                economicActivityId
            })
        setAlicuotaHistory(alicuotaHistory)
    }

    async function loadEconomicActivity() {
        if (business?.economicActivityId) {
            const fetchedEconomicActivity = await economicActivitiesService.findById(business.economicActivityId);

            if (!fetchedEconomicActivity?.currentAlicuota?.id) {
                messageApi.error('La actividad económica no tiene Alicuota actual')
                console.error('La actividad económica no tiene Alicuota actual')
                
                setTimeout(() => {
                    navigate(-1)
                }, 1000)
            }

            console.log({fetchedEconomicActivity})
            // form.setFieldsValue({
            //     alicuota: fetchedEconomicActivity.alicuota
            // });

            setEconomicActivity(fetchedEconomicActivity);
        }
    }

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
        setFileList(newFileList);
    };

    async function onFinish(values: any) {

        console.log('Form values:', values);

        try {
            let declarationImageUrl = null;

            // ! disabled for now
            // if (!values.declarationImage) {
            //     message.error('Por favor suba la declaración');
            //     return false;
            // }

            if (values.declarationImage) {
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
            }
            

            
            const newGrossIncome: IGrossIncome = {
                ...grossIncome, // to ensure that all initial properties are present

                ...values,
                period: values.period.format('YYYY-MM-DD'),
                businessId: Number(businessId),
                branchOfficeId: branchOfficeId,
                declarationImage: declarationImageUrl,

                alicuotaTaxPercent: percentHandler(values.alicuotaTaxPercent).divide(100).value,
            };

            if (!hasBranchOffices) {
                // TODO: Delete after setting the default value as false in database
                newGrossIncome.chargeWasteCollection = false
            }

            newGrossIncome.alicuotaId = values.alicuotaId
            newGrossIncome.currencyExchangeRatesId = values.currencyExchangeRatesId

            console.log('newGrossIncome', newGrossIncome)

            // if is editing, update the gross income
            if (isEditing) {
                const updatedGrossIncome = await grossIncomeApi.updateGrossIncome(newGrossIncome);
                message.success('Ingreso bruto actualizado exitosamente');
            } else {
                const registeredGrossIncome = await grossIncomeApi.registerGrossIncome(newGrossIncome);
                message.success('Ingreso bruto registrado exitosamente');
            }

            navigate(-1);
            
        } catch (error) {
            console.error('Error al registrar ingreso bruto:', error);
            messageApi.error(error.message);
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
        <>
            {contextHolder}
            <Card title={<Title level={2}>{isEditing ? 'Editando' : 'Registrando'} Ingresos Brutos</Title>}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        period: dayjs().subtract(1, 'month'),
                        amountBs: 0
                    }}
                >
                    { hasBranchOffices && <Form.Item
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
                            disabled={isEditing}
                        />
                    </Form.Item> }

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
                                min={0}
                                step={0.01}
                                decimalSeparator=','
                                />
                        </Form.Item>

                        <Form.Item
                            name="declarationImage"
                            label="Declaración"
                            // ! disabled for now
                            // rules={[{ required: true, message: 'Por favor suba la declaración' }]}
                        >
                            <Upload
                                {...uploadProps}
                            >
                                <Button icon={<UploadOutlined />}>Subir Declaración</Button>
                            </Upload>
                        </Form.Item>
                    </Flex>

                    
                    <Flex gap={16} align='center' justify='space-between'>
                        <Typography.Title level={4}>Tasa de Cambio</Typography.Title>
                        <Button onClick={() => updateTCMMVBCV()}>
                            <ReloadOutlined/>
                            Actualizar
                        </Button>
                    </Flex>
                    <Form.Item
                            name="TCMMVBCV"
                            label="TC-MMVBCV"
                            rules={[{ required: true, message: 'Por favor introduzca la tasa de cambio de la MMVBCV' }]}

                            layout='horizontal'
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                addonAfter='Bs'
                                min={0}
                                step={0.01}
                                decimalSeparator=','
                            />
                        </Form.Item>
                    
                    <Flex align='center' justify='space-between'>
                        <Typography.Title level={4}>Alicuota</Typography.Title>
                        <Button onClick={() => updateAlicuota()}>
                        <ReloadOutlined/>
                            Actualizar
                        </Button>
                    </Flex>
                    <Flex gap={16} wrap>
                        
                        
                        <Form.Item
                            name="alicuotaId"
                            label="Alicuota Referencia"
                            rules={[{ required: true, message: 'Por favor seleccione una alicuota' }]}
                        >
                            <Select placeholder="Seleccione una alicuota" options={alicuotaHistoryOptions}/>
                        </Form.Item>

                        <Form.Item
                            name="alicuotaTaxPercent"
                            label="Alicuota"
                            rules={[{ required: true, message: 'Por favor, ingrese la alicuota' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                addonAfter='%'
                                min={0}
                                step={0.01}
                                decimalSeparator=','
                                // disabled
                            />
                        </Form.Item>

                        <Form.Item
                            name="alicuotaMinTaxMMVBCV"
                            label="Min. Tributario"
                            rules={[{ required: true, message: 'Por favor, ingrese el minimo tributario' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                addonAfter='MMVBCV'
                                min={0}
                                step={0.01}
                                decimalSeparator=','
                                // disabled
                            />
                        </Form.Item>

                        {/* <Form.Item
                            name="currencyExchangeRatesId"
                            label="Tasa de Cambio"
                            rules={[{ required: true, message: 'Por favor seleccione una tasa de cambio' }]}
                        >
                            <Select placeholder="Seleccione una tasa de cambio" options={currencyExchangeRateOptions}/>
                        </Form.Item> */}
                    </Flex>


                    
                    {
                        hasBranchOffices &&
                            (<Flex vertical>
                                <Flex align='center' justify='space-between'>
                                    <Typography.Title level={4}>Aseo Urbano</Typography.Title>
                                    <Button onClick={() => updateWasteCollection()}>
                                        <ReloadOutlined/>
                                        Actualizar
                                    </Button>
                                </Flex>
            
                                <Flex vertical>
                                
                                    <Form.Item
                                        name="chargeWasteCollection"
                                        valuePropName="checked"
                                    >
                                        <Checkbox>¿Cobrar Aseo Urbano?</Checkbox>
                                    </Form.Item>

                                    <Flex gap={16}>

                                        <Form.Item
                                            name="branchOfficeDimensionsMts2"
                                            label="Dimensiones"
                                            rules={[{ required: true, message: 'Por favor introduzca la tasa de cambio de la MMVBCV' }]}
                                            
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                addonAfter='Mts2'
                                                min={0}
                                                step={0.01}
                                                decimalSeparator=','
                                                disabled={!chargeWasteCollectionTax}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="branchOfficeType"
                                            label="Tipo de Terreno"
                                            rules={[{ required: true, message: 'Por favor introduzca el tipo de terreno para esta sucursal (I, II o III)' }]}
                                        >
                                            <Input
                                                
                                                disabled={!chargeWasteCollectionTax}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="wasteCollectionTaxMMVBCV"
                                            label="Impuesto (MMVBCV)"
                                            rules={[{ required: true, message: 'Por favor introduzca el impuesto por aseo urbano en MMVBCV' }]}
                                            
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                addonAfter='MMVBCV'
                                                min={0}
                                                step={0.01}
                                                decimalSeparator=','
                                                disabled={!chargeWasteCollectionTax}
                                            />
                                        </Form.Item>
                                    </Flex>
                                </Flex>
                            </Flex>)
                    }
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Guardar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </>
    );
};

export default TaxCollectionBusinessGrossIncomesEdit;




// const DeclarationImageUpload: React.FC<{initialFileList: UploadFile[]}> = ({initialFileList}) => {
//     const [fileList, setFileList] = useState<UploadFile[]>(initialFileList);

//     // const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }): void => {
//     //     console.log('newFileList', newFileList)
//     //     setFileList([...newFileList]); // Only keep the last uploaded file
//     // };

//     useEffect(() => {
//         // console.log('setting initialFileList', initialFileList)
//         setFileList([...initialFileList]);
//     }, [initialFileList]);

//     // const uploadProps: UploadProps = {
// 	// 	onRemove: (file) => {
// 	// 		const index = fileList.indexOf(file);
// 	// 		const newFileList = fileList.slice();
// 	// 		newFileList.splice(index, 1);
// 	// 		setFileList(newFileList);
// 	// 	},
// 	// 	beforeUpload: (file) => {
// 	// 		console.log("adding files")
// 	// 		setFileList([...fileList, file]);

// 	// 		return false;
// 	// 	},
// 	// 	onChange: ({ fileList: newFileList }) => {
// 	// 		setFileList(newFileList)
// 	// 	},
// 	// 	fileList,
// 	// 	maxCount: 1
// 	// }

//     return (
//         <Upload/>
//     );
// };
