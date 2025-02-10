import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { FilePdfOutlined, FileExcelOutlined, ReloadOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, DatePicker, Flex, Form, Input, InputNumber, message, Select, Typography, Upload, List, Image } from 'antd';

import CustomInputNumber from './components/FormInputNumberBs';


import currency from 'currency.js'

const Dragger = Upload.Dragger;

import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';

import * as api from '../util/api';
import * as grossIncomeApi from '../util/grossIncomeApi';
import alicuotaService from '../services/alicuotaService';
import currencyExchangeRatesService from '../services/CurrencyExchangeRatesService';
import economicActivitiesService from '../services/EconomicActivitiesService';
import * as filesService from '../services/filesService';

import * as util from '../util';

import type { BranchOffice, Business, IGrossIncome, EconomicActivity, CurrencyExchangeRate, IAlicuota } from '../util/types';
import { completeUrl } from './BusinessShared';
import { percentHandler } from 'util/currency';

import useAuthentication from 'hooks/useAuthentication';

const { Title } = Typography;
// const { Option } = Select;

import { CurrencyHandler } from "../util/currency"

const TaxCollectionBusinessGrossIncomesEdit: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { businessId, grossIncomeId } = useParams();
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [grossIncome, setGrossIncome] = useState<IGrossIncome>();
    const [business, setBusiness] = useState<Business>();
    const [economicActivity, setEconomicActivity] = useState<EconomicActivity>();

    const { userAuth } = useAuthentication();

    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);

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
    const [filesToDeleteIds, setFilesToDeleteIds] = useState<number[]>([]);

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
    
    const TCMMVBCV = Form.useWatch('TCMMVBCV', form)
    const wasteCollectionTaxMMVBCV = Form.useWatch('wasteCollectionTaxMMVBCV', form)
    const wasteCollectionTaxBsExpected = Form.useWatch('wasteCollectionTaxBsExpected', form)

    const alicuotaMinTaxMMVBCV = Form.useWatch('alicuotaMinTaxMMVBCV', form)
    const alicuotaMinTaxBsExpected = Form.useWatch('alicuotaMinTaxBsExpected', form)

    const amountBs = Form.useWatch('amountBs', form)
    const alicuotaTaxPercent = Form.useWatch('alicuotaTaxPercent', form)
    const chargeWasteCollection = Form.useWatch('chargeWasteCollection', form)

    useEffect(() => {
        if (TCMMVBCV && wasteCollectionTaxMMVBCV) {
            form.setFieldsValue({
                wasteCollectionTaxBsExpected: util.getWasteCollectionTaxInBs(null, TCMMVBCV, wasteCollectionTaxMMVBCV)
            })
        }
    }, [TCMMVBCV, wasteCollectionTaxMMVBCV])

    useEffect(() => {
        if (TCMMVBCV && alicuotaMinTaxMMVBCV) {
            form.setFieldsValue({
                alicuotaMinTaxBsExpected: util.getMinTaxInBs(null, TCMMVBCV, alicuotaMinTaxMMVBCV)
            })
        }
    }, [TCMMVBCV, alicuotaMinTaxMMVBCV])

    useEffect(() => {

        let taxBs = CurrencyHandler(amountBs).multiply(percentHandler(alicuotaTaxPercent).divide(100).value).value

        form.setFieldsValue({
            totalTaxBsExpected: CurrencyHandler(taxBs > alicuotaMinTaxBsExpected ? taxBs : alicuotaMinTaxBsExpected).add(chargeWasteCollection ? wasteCollectionTaxBsExpected : 0).value
        })

    }, [alicuotaMinTaxBsExpected, wasteCollectionTaxBsExpected, chargeWasteCollection, alicuotaTaxPercent, amountBs])

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

        form.setFieldsValue({
            declaredAt: dayjs(),
        })
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

            const searchParamBranchOfficeId = searchParams.get('branchOfficeId');
            const periodString = searchParams.get('period');

            if (searchParamBranchOfficeId && periodString) {
                form.setFieldsValue({
                    branchOffice: Number(searchParamBranchOfficeId),
                    chargeWasteCollection: branchOffices.find(office => office.id === Number(searchParamBranchOfficeId))?.chargeWasteCollection,
                    period: dayjs(periodString, 'YYYY-MM')
                })

                return;
            }
    
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

            let declaredAt = grossIncome.declaredAt ?? dayjs()
            // console.log('grossIncome', grossIncome)
            form.setFieldsValue({
                ...grossIncome,
                declaredAt,
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
        setBranchOffices(fetchedBranchOffices.filter( office => office.isActive));
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
            setLoading(true);
            let declarationImageUrl = null;

            // get the list of images to upload
            // for each image, upload them to the server and get the id of the image
            // once i get the image ids, asigne the ids to a given gross income 
            let uploadingFilesPromises = fileList.map(async (file) => {
                try {
                    // upload the file
                    let fileData = await filesService.uploadFile({
                        file: file.originFileObj, folder: 'grossIncomes', token: userAuth.token ?? undefined
                    })

                    // return the id of the file 
                    return { id: fileData.id, temporalId: file.uid }

                } catch (error) {
                    console.log({error})
                    message.error(error.message);

                    let errorResponse = new Error("Can't upload the file")
                    errorResponse.fileTemporaryId = file.uid
                    throw errorResponse
                }
            })

            let resolvedPromises = await Promise.allSettled(uploadingFilesPromises)

            

            let supportFilesIds = resolvedPromises.map((promise) => {
                if (promise.status === 'fulfilled') {
                    return promise.value.id
                } else {
                    return -1
                }
            })

            console.log({resolvedPromises, supportFilesIds})


            // ! disabled for now
            // if (!values.declarationImage) {
            //     message.error('Por favor suba la declaración');
            //     return false;
            // }

            // if (values.declarationImage) {
            //     // if there is no new files, values.declarationImage will be undefined
            //     if (values.declarationImage.uid === '-1') {
            //         console.log('no new files')
            //         declarationImageUrl = grossIncome?.declarationImage;
            //     } else {
            //         // otherwise, values.declarationImage will be the file object, in this case, should update the image
            //         const file = values.declarationImage.file
                    
            //         try {
            //             declarationImageUrl = await grossIncomeApi.uploadDeclarationImage(file, userAuth.token ?? null);
                        
            //         } catch (error) {
            //             console.error('Error uploading declaration image:', error);
            //             message.error(error.message);
            //             return false;
            //         }
            //     }
            // }
            
            const newGrossIncome: IGrossIncome = {
                ...grossIncome, // to ensure that all initial properties are present

                ...values,
                period: values.period.format('YYYY-MM-DD'),
                businessId: Number(businessId),
                branchOfficeId: branchOfficeId,
                declarationImage: '', //declarationImageUrl,

                alicuotaTaxPercent: percentHandler(values.alicuotaTaxPercent).divide(100).value,
            };

            if (!hasBranchOffices) {
                // TODO: Delete after setting the default value as false in database
                newGrossIncome.chargeWasteCollection = false
            }

            newGrossIncome.alicuotaId = values.alicuotaId
            newGrossIncome.currencyExchangeRatesId = values.currencyExchangeRatesId

            if (isEditing) {
                newGrossIncome.updatedByUserId = userAuth.user.id
            } else {
                newGrossIncome.createdByUserId = userAuth.user.id
            }

            console.log('newGrossIncome', newGrossIncome)

            // if is editing, update the gross income

            let returnedGrossIncomeId = 0
            if (isEditing) {
                const updatedGrossIncome = await grossIncomeApi.updateGrossIncome(newGrossIncome, userAuth.token ?? null);
                message.success('Ingreso bruto actualizado exitosamente');

                returnedGrossIncomeId = updatedGrossIncome.id
            } else {
                const registeredGrossIncome = await grossIncomeApi.registerGrossIncome(newGrossIncome, userAuth.token ?? null);
                message.success('Ingreso bruto registrado exitosamente');

                returnedGrossIncomeId = registeredGrossIncome.id
            }

            if (supportFilesIds) {
                let response = await grossIncomeApi.addSupportFiles(returnedGrossIncomeId, supportFilesIds.filter( id => id !== undefined ), userAuth.token)

                console.log({response})
            }

            if (filesToDeleteIds) {
                let response = await grossIncomeApi.removeSupportFiles(grossIncomeId, filesToDeleteIds, userAuth.token)

                console.log({response})
            }

            navigate(-1);
            
        } catch (error) {
            console.error('Error al registrar ingreso bruto:', error);
            messageApi.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps: UploadProps = {
        // onPreview: async (file: UploadFile) => {
            
        // },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList)
        },
        beforeUpload: (file) => {
			console.log("adding files")
			setFileList([...fileList, file]);

			return false && Upload.LIST_IGNORE;
		},
        fileList,
        // maxCount: 1

    }

    const handleDeleteSupportFile = async (fileId: number) => {
        // if id is not in files to delete, add it

        // is id in files to delete, remove it from files to delete

        if (filesToDeleteIds.includes(fileId)) {
            setFilesToDeleteIds(filesToDeleteIds.filter(id => id !== fileId))
        } else {
            setFilesToDeleteIds([...filesToDeleteIds, fileId])
        }
    };

    return (
        <>
            {contextHolder}
            <Card title={<Title level={2}>{isEditing ? 'Editando' : 'Registrando'} Ingresos Brutos de { business?.businessName } </Title>}>
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
                        label="Sede"
                        rules={[{ required: hasBranchOffices, message: 'Por favor seleccione la sede' }]}
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
                            label="Fecha de declaración" name="declaredAt"
                            rules={[{ required: true, message: 'Por vavor ingrese la fecha de declaración'}]}
                        >
                            <DatePicker picker="date"/>
                        </Form.Item>
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
                            rules={[
                                { 
                                    required: true, 
                                    message: 'Por favor ingrese el ingreso bruto' 
                                }]}                            
                        >
                            <CustomInputNumber
                                style={{ width: '100%' }}
                                addonAfter='Bs'
                                min={0}
                                step={0.01}
                            />
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
                            <CustomInputNumber
                                style={{ width: '100%' }}
                                addonAfter='Bs'
                                min={0}
                                step={0.0001}
                                
                                
                                
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
                            <CustomInputNumber
                                style={{ width: '100%' }}
                                addonAfter='%'
                                min={0}
                                step={0.0001}

                                
                                // disabled
                            />
                        </Form.Item>

                        <Form.Item
                            name="alicuotaMinTaxMMVBCV"
                            label="Min. Tributario"
                            rules={[{ required: true, message: 'Por favor, ingrese el minimo tributario' }]}
                        >
                            <CustomInputNumber
                                style={{ width: '100%' }}
                                addonAfter='MMVBCV'
                                min={0}
                                step={0.0001}
                                
                                // disabled
                            />
                        </Form.Item>

                        <Form.Item
                            name="alicuotaMinTaxBsExpected"
                            label="Min. Tributario (Esperado)"
                            rules={[{ required: false, message: 'Por favor, ingrese el minimo tributario' }]}
                            
                        >
                            <CustomInputNumber
                                style={{ width: '100%' }}
                                addonAfter='Bs'
                                min={0}
                                step={0.01}
                                
                                
                                
                                disabled
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

                                    <Flex gap={16} wrap>

                                        <Form.Item
                                            name="branchOfficeDimensionsMts2"
                                            label="Dimensiones"
                                            rules={[{ required: true, message: 'Por favor introduzca la tasa de cambio de la MMVBCV' }]}
                                            
                                        >
                                            <CustomInputNumber
                                                style={{ width: '100%' }}
                                                addonAfter='Mts2'
                                                min={0}
                                                step={0.01}
                                                
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
                                            <CustomInputNumber
                                                style={{ width: '100%' }}
                                                addonAfter='MMVBCV'
                                                min={0}
                                                step={0.0001}
                                                precision={4}
                                                
                                                disabled={!chargeWasteCollectionTax}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="wasteCollectionTaxBsExpected"
                                            label="Impuesto Aseo (Esperado)"
                                            rules={[{ required: false, message: 'Por favor introduzca el impuesto por aseo urbano en MMVBCV' }]}
                                        >
                                            <CustomInputNumber
                                                style={{ width: '100%' }}
                                                addonAfter='Bs'
                                                min={0}
                                                step={0.01}
                                                decimalSeparator=','
                                                disabled
                                            />
                                        </Form.Item>
                                    </Flex>

                                    <Form.Item
                                            name="totalTaxBsExpected"
                                            label="Total a pagar (Esperado)"
                                        >
                                        <CustomInputNumber
                                            style={{ width: '100%' }}
                                            addonAfter='Bs'
                                            min={0}
                                            step={0.01}
                                            
                                            disabled
                                        />
                                    </Form.Item>
                                </Flex>
                            </Flex>)
                    }

                    <Flex gap={16} vertical>
                        <Form.Item
                            name="declarationImage"
                            // ! disabled for now
                            // rules={[{ required: true, message: 'Por favor suba la declaración' }]}
                        >
                            <Dragger {...uploadProps}>
                                <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Haga click o arrastre aquí los soportes de la declaración</p>
                                {/* <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                                banned files.
                                </p> */}
                            </Dragger>
                            
                        </Form.Item>
                    </Flex>

                    { grossIncome?.supportFiles.length > 0 && (<Flex vertical>
                        
                        <Title level={4}>Soportes Asociados</Title>

                        <List
                            dataSource={grossIncome?.supportFiles}
                            renderItem={(supportFile) => {

                                let icon = null
                                let iconProps = {
                                    style: {
                                        fontSize: '1.5em'
                                    }
                                }

                                let willBeDeleted = filesToDeleteIds.includes(supportFile.id)

                                if (supportFile.type === 'image') {
                                    icon = <Image 
                                        width={40}
                                        height={40}
                                        src={supportFile.url}
                                    />
                                }

                                if (supportFile.url.endsWith('.pdf')) {
                                    icon = <FilePdfOutlined {...iconProps}/>
                                }

                                if (supportFile.url.endsWith('.xlsx') || supportFile.url.endsWith('.xls') || supportFile.url.endsWith('.xlsm')) {
                                    icon = <FileExcelOutlined {...iconProps}/>
                                }

                                return (
                                <List.Item
                                    style={{
                                        marginBottom: '5px',
                                        padding: '5px',
                                        borderRadius: '5px',
                                        border: willBeDeleted ? '1px solid red' : ''}}
                                    actions={[<Button type='link' icon={<DeleteOutlined />} onClick={() => {
                                        handleDeleteSupportFile(supportFile.id)
                                    }}></Button>]}
                                >
                                    <Flex align='center' gap={10}>
                                        <Flex align='center' justify='center' style={{ minWidth: '40px'}}>
                                            {icon}
                                        </Flex>
                                        <a href={supportFile.url} target="_blank" rel="noopener noreferrer">Archivo adjunto</a>
                                    </Flex>
                                </List.Item>
                            )}}
                        />
                    </Flex>)}

                    <br/>
                    
                    <Form.Item>
                        <Button 
                            loading={loading}
                            disabled={loading}
                            type="primary" 
                            htmlType="submit">
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
