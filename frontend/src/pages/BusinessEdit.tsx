import { useEffect, useState } from 'react'
import { DatePicker, FormProps, InputNumber, Select, Space, Upload, Image } from 'antd'
import { Form, Input, Button, message, Flex, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography
import { useParams } from 'react-router-dom';

import dayjs from 'dayjs';

import { 
    businessPriority, 
    channelMapping, 
    channelOptions, 
    contactMapping, 
    contactOptions, 
    getBase64, 
    // getCommunicationPreference, 
    getPreferredChannelName, 
    getPreferredContactType, 
    handleDimensionsChange, 
    reminderIntervalMap, 
    reminderIntervalMapReverse, 
    reminderIntervalOptions, 
    typeOfBranchOffice, 
    typeOfFieldOptions, 
    updateBusinessWithDateFromForm, 
    urlToFile, 
    ZONES
} from './BusinessShared'

import type { BusinessFormFields } from './BusinessShared';

import type { 
    GetProp, 
    UploadFile, 
    UploadProps 
} from 'antd';

import * as api from '../util/api'

import type { 
    Business,
    BranchOffice,
    Person
} from '../util/api'



const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type FormFields = {
    businessName: string
    dni: string
    email: string
}

function BusinessEdit(): JSX.Element {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);

    const [business, setBusiness] = useState<Business>()
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>()

    const [branchOfficesToDelete, setBranchOfficesToDelete] = useState<number[]>([])

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([])

    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

    //const [business, setBusiness] = React.useState<Business>()
    let { businessId } = useParams();


    function clearForm(){
		form.setFieldValue('businessName', '')
		form.setFieldValue('dni', '')
        form.setFieldValue('email', '')
	}

    // get the business by the id in the url 
    useEffect(() => {
        // first load of data
        loadBusinessData()
        loadEconomicActivityData()
    }, [])

    useEffect(() => {
        initFormData()
    }, [business, branchOffices])

    async function initFormData() {
        if (!business) {
            return 
        }

        form.setFieldValue('businessName', business?.businessName)
        form.setFieldValue('dni', business?.dni)
        form.setFieldValue('email', business?.email)

        form.setFieldValue('branchOffices', branchOffices)

        console.log(JSON.stringify(business, null, 2))
        form.setFieldValue('companyIncorporationDate', dayjs('2040-1-1'))
        const formInitData = {
            companyIncorporationDate: dayjs(business.companyIncorporationDate),
            companyExpirationDate: dayjs(business.companyExpirationDate),
            directorsBoardExpirationDate: dayjs(business.directorsBoardExpirationDate),

            economicActivity: business.economicActivity.title,
            preferredContact: getPreferredContactType(business),
            preferredChannel: getPreferredChannelName(business.preferredChannel),
            sendCalculosTo: getPreferredChannelName(business.sendCalculosTo),
            reminderInterval: '',

            owner: business.owner
        }

        if(business.reminderInterval) {
            formInitData.reminderInterval = reminderIntervalMapReverse[business.reminderInterval]
        }

        form.setFieldsValue(formInitData)

        const urlOwnerPfp = business?.owner?.profilePictureUrl
        if (urlOwnerPfp) {
            const file = await urlToFile(urlOwnerPfp, urlOwnerPfp.split('/')[-1], 'image/png')
            setFileList([{
                uid: String(Date.now()),
                name: file.name,
                status: 'done',
                url: urlOwnerPfp,
                originFileObj: file,
            }])
        }
    }

    async function loadBusinessData() {
        // get the business data 
        // feed the form with the business data
        if (businessId) {
            let businessData = await api.fetchBusinessById(Number(businessId))
            let branchOffices = await api.fetchBranchOffices(Number(businessId))

            setBusiness(businessData)
            setBranchOffices(branchOffices)

            console.log(JSON.stringify(business, null, 2))
        }
    }

    async function loadEconomicActivityData() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    const onFinish: FormProps<FiledType>['onFinish'] = async (values) => {

        if (!business) {
            return ''
        }
    
        try {
            // Log the form values for debugging
            console.log("Business information from form to be updated")
            console.log(JSON.stringify(values, null, 2));
    
            // Destructure contacts from values
            const { owner, accountant, administrator, branchOffices, ...businessData } = values;
    
            // Helper function to create or update a contact
            const upsertContact = async (contact: Person, existingId: number | undefined) => {
                if (existingId) {
                    // If contact has an ID, update it
                    return await api.updatePerson(existingId, contact);
                } else {
                    alert("the id is not defined, creating new contact")
                    // If contact is new, create it
                    return await api.registerPerson(contact);
                }
            };
    
            // Upsert owner
            const ownerPfpUrl = await handleUpload()
            owner.profilePictureUrl = ownerPfpUrl
            const registeredOwner = await upsertContact(owner, business.ownerPersonId);
    
            // Upsert accountant
            let registeredAccountant;
            if (accountant?.firstName) {
                registeredAccountant = await upsertContact(accountant, business.accountantPersonId);
            }
    
            // Upsert administrator
            let registeredAdministrator;
            if (administrator?.firstName) {
                registeredAdministrator = await upsertContact(administrator, business.administratorPersonId);
            }

            // delete branch offices
            console.log({branchOfficesToDelete})
            for (const id of branchOfficesToDelete) {
                await api.deleteBranchOffice(id);
                console.log(`Deleted branch office with ID: ${id}`);
            }
            // Optionally, you can clear the list after deletion
            setBranchOfficesToDelete([]);
    
            // Upsert branch offices
            for (const office of branchOffices) {
                if (office.id) {
                    // If branch office has an ID, update it
                    await api.updateBranchOffice(office.id, office);
                } else {
                    // If branch office is new, create it with the business ID
                    await api.registerBranchOffice({ ...office, businessId: business.id });
                }
            }
    
            // Get the economic activity ID
            const economicActivityObject = economicActivities.find(e => e.title === values?.economicActivity);
            const economicActivityId = economicActivityObject?.id;
    
            // Prepare the business data to be sent
            const newBusinessData = {
                ...businessData,
                economicActivityId,
                ownerPersonId: registeredOwner.id,
                accountantPersonId: registeredAccountant?.id,
                administratorPersonId: registeredAdministrator?.id,

                preferredChannel: '',
                sendCalculosTo: '',
                preferredContact: '',
                reminderInterval: ''
            }

            newBusinessData.preferredChannel = values.preferredChannel && channelMapping[values.preferredChannel]
            newBusinessData.sendCalculosTo = values.sendCalculosTo && channelMapping[values.sendCalculosTo]
            newBusinessData.preferredContact = values.preferredContact && contactMapping[values.preferredContact]
            newBusinessData.reminderInterval = values.reminderInterval && reminderIntervalMap[values.reminderInterval]

            console.log("before sending the business update")
            console.log({preferredChannel: values.preferredChannel && channelMapping[values.preferredChannel],
                a: channelMapping[values.preferredChannel],
                b: values.preferredChannel

            })
            console.log("Business information that will be updated")
            console.log(JSON.stringify(newBusinessData, null, 2))

            // Send the updated business data to the server
            await api.updateBusinessData(business.id, newBusinessData);
    
            // Display success message
            messageApi.open({
                type: 'success',
                content: "Contribuyente actualizado exitosamente",
            });
    
            // Optionally clear the form
            // clearForm();
        } catch (error) {
            console.error('Error saving business:', error);
    
            // Handle error messages
            let msg = "Hubo un error";
            msg = error.message === "duplicated dni" ? "Cédula ya registrada" : error.message
    
            // Display error message
            messageApi.open({
                type: 'error',
                content: msg,
            });
        }
    };

    function removeBranchOffice(officeIndex, removeFunction) {
        // get the office id
        const branchOffices = form.getFieldsValue().branchOffices
        console.log({officesInRemoveOffcies: branchOffices})

        const officeIdToDelete = branchOffices[officeIndex]?.id

        if(officeIdToDelete) {
            console.log({deletingOffice: officeIdToDelete})
            // save the office id into another list of office to remove
            setBranchOfficesToDelete([...branchOfficesToDelete, officeIdToDelete])
        }

        // remove the office with the office index
        return removeFunction(officeIndex)
    }

    async function handleUpload (): Promise<string>{
        if (!business) {
            return ''
        }

        if (fileList.length === 0) {
            message.error('No file selected');
            return '';
        }

        console.log({URL: fileList[0].url})
        console.log({file: fileList[0].url})
        if(fileList[0].url === business.owner?.profilePictureUrl) {
            return business.owner?.profilePictureUrl
        }
    
        const formData = new FormData();
        formData.append('image', fileList[0].originFileObj);
    
        try {
            const response = await fetch(`${HOST}/v1/people/pfp`, {
                method: 'POST',
                body: formData,
                headers: {
                    // 'Content-Type': 'multipart/form-data' is not needed; browser sets it automatically.
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                // message.success(`File uploaded successfully. URL: ${data.url}`);
                console.log(`File uploaded successfully. URL: ${data.url}`)
                return data.url
            } else {
                // message.error('Upload failed');
                console.log('Upload failed')
            }
        } catch (error) {
            // message.error('Upload failed');
            console.log({error})
            
        }
        return ''
    };

    const ownerPfpProps: UploadProps = {
        onPreview: async (file: UploadFile) => {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj as FileType);
            }
        
            setPreviewImage(file.url || (file.preview as string));
            setPreviewOpen(true);
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
        listType: "picture-card",
        maxCount: 1
    }

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Cargar Foto de Perfil</div>
        </button>
    )


    return (
        <Flex>
            {contextHolder}
            
            <Form form={form}
                onFinish={onFinish}
            >
                <Form.Item<FormFields>
                    rules={[
                        {
                            required: true,
                            message: "Introduzca la razón social"
                        }
                    ]}
                    label='Razón Social'
                    name='businessName'
                >
                    <Input
                        data-test="business-name-input"
                    />
                </Form.Item>
                <Form.Item<FormFields>
                    rules={[
                        {
                            required: true,
                            message: "Introduzca el rif o la cédula"
                        }
                    ]}
                    label='Rif o Cédula'
                    name='dni'
                >
                    <Input
                        data-test="business-dni-input"
                    />
                </Form.Item>
                {/* <Form.Item<FormFields>
                    label='Correo Electrónico'
                    name='email'
                >
                    <Input/>
                </Form.Item> */}

                <Form.Item
                    // it can be normal or special 
                    label='Tipo de Contribuyente: '
                    name='type'
                    data-test="business-type-select"
                >
                    <Select
                        
                        showSearch
                        defaultValue={'Normal'}
                        options={businessPriority}
                    />
                </Form.Item>

                <Flex>
                    {/* Define good names */}
                    


                    <Form.Item
                        label='Fecha Constitución: '
                        name='companyIncorporationDate'
                    >
                        <DatePicker data-test="business-incorporation-date-input"/>
                    </Form.Item>

                    <Form.Item
                        label='Fecha Vencimiento de la Empresa: '
                        name='companyExpirationDate'
                    >
                        <DatePicker data-test="business-expiration-date-input"/>
                    </Form.Item>
                    <Form.Item
                        label='Fecha Vencimiento Junta Directiva: '
                        name='directorsBoardExpirationDate'
                    >
                        <DatePicker data-test="business-board-expiration-date-input"/>
                    </Form.Item>
                </Flex>

                <Form.Item<BusinessFormFields>
                    rules={[
                        {
                            required: true,
                            message: "Seleccione una actividad económica"
                        }
                    ]}
                    // it can be normal or special 
                    label='Actividad Económica: '
                    name='economicActivity'
                >
                    <Select
                        data-test='business-economic-activity-input'
                        //defaultValue={economicActivities[0]?.title}
                        showSearch
                        options={economicActivities.map( e => ({ label: e?.title, value: e?.title}))}
                    />
                </Form.Item>

                <Title level={3}>
                    Preferencias de comunicación
                </Title>

                <div>
                    <Form.Item<BusinessFormFields> 
                            label='Agente encargado de finanzas: '
                            name='preferredContact'
                    >
                        <Select
                            data-test="communication-options-preferred-contact"
                            showSearch
                            style={{minWidth: "150px"}}
                            options={contactOptions}
                        />
                    </Form.Item>
                    <Form.Item<BusinessFormFields>
                        label='Medio preferido de comunicación: '
                        name="preferredChannel"
                    >
                        <Select
                            data-test="communication-options-preferred-channel"
                            showSearch
                            style={{minWidth: "150px"}}
                            options={channelOptions}
                        />
                    </Form.Item>

                    <Form.Item<BusinessFormFields>
                        label="Enviar cálculos al: "
                        name="sendCalculosTo"
                    >
                        <Select
                            data-test="communication-options-send-calculos"
                            showSearch
                            style={{minWidth: "150px"}}
                            options={channelOptions}
                        />
                    </Form.Item>
                    
                    <Form.Item<BusinessFormFields>
                        label="Recordatorios: "
                        name="reminderInterval"
                    >
                        <Select
                            data-test="communication-options-reminder-interval"
                            showSearch
                            style={{minWidth: "150px"}}
                            options={reminderIntervalOptions}
                        />
                    </Form.Item>
                </div>
                
                <Title level={3}>
                    Propietario
                </Title>

                <Space>
                    {previewImage && (
                        <Image
                            wrapperStyle={{ display: 'none' }}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}
                    <Upload
                        data-test="business-new-owner-pfp"
                        {...ownerPfpProps}
                    >
                        {fileList.length < 5 ? uploadButton : null }
                    </Upload>

                    <Form.Item<BusinessFormFields>
                        rules={[
                            {
                                required: true,
                                message: "El nombre del propietario es requerido"
                            }
                        ]}
                        label='Nombre: '
                        name={["owner", "firstName"]}
                    >
                        <Input data-test='owner-first-name-input'/>
                    </Form.Item>
                    <Form.Item<BusinessFormFields>
                        rules={[
                            {
                                required: true,
                                message: "El apellido del propietario es requerido"
                            }
                        ]}
                        label='Apellido: '
                        name={["owner", "lastName"]}
                    >
                        <Input data-test="owner-last-name-input"/>
                    </Form.Item>
                    <Form.Item<BusinessFormFields>
                        rules={[
                            {
                                required: true,
                                message: "La cédula del propietario es requerida"
                            }
                        ]}
                        label='Cédula'
                        name={["owner", "dni"]}
                    >
                        <Input data-test="owner-dni-input"/>
                    </Form.Item>
                </Space>
                <Form.Item<BusinessFormFields>
                    rules={[
                        {
                            required: true,
                            message: "El teléfono del propietario es requerido"
                        }
                    ]}
                    label='Teléfono: '
                    name={["owner", "phone"]}
                >
                    <Input data-test="owner-phone-input"/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["owner", "whatsapp"]}
                >
                    <Input data-test="owner-whatsapp-input"/>
                </Form.Item>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "El correo del propietario es requerido"
                        }
                    ]}
                    label='Correo: '
                    name={["owner", "email"]}
                >
                    <Input data-test="owner-email-input"/>
                </Form.Item>


                <Form.List
                    name='branchOffices'>
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    <h3>Sucursales</h3>
                                    {
                                        fields.map(field => {
                                            return (
                                                <div key={field.name}>
                                                    <span>
                                                        <h4>
                                                            #{ field.name + 1 } 
                                                            <Button onClick={() => removeBranchOffice(field.name, remove)}>Eliminar</Button>
                                                            
                                                        </h4>
                                                        <Form.Item label="Dirección" name={[field.name, 'address']}>
                                                            <Input />
                                                        </Form.Item>

                                                        <Flex wrap gap='middle'>
                                                            <Form.Item style={{width: "40%"}} label="Zona" name={[field.name, 'zone']}>
                                                                <Select
                                                                    data-test={`branch-office-${field.name}-zone`}
                                                                    showSearch
                                                                    options={ZONES}
                                                                />
                                                                
                                                            </Form.Item>

                                                            <Form.Item label="Dimensiones (m2)" name={[field.name, 'dimensions']} style={{width: "20%"}} >
                                                                <InputNumber
                                                                    data-test={`branch-office-${field.name}-dimensions`}
                                                                    onChange={(dimensions) => dimensions && handleDimensionsChange(field.name, Number(dimensions), form)}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item label="Tipo" name={[field.name, 'type']}>
                                                                <Select
                                                                    data-test={`branch-office-${field.name}-zone`}
                                                                    showSearch
                                                                    options={typeOfFieldOptions}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item label="Procedencia" name={[field.name, 'origin']}>
                                                                <Select
                                                                    data-test={`branch-office-${field.name}-origin`}
                                                                    showSearch
                                                                    options={typeOfBranchOffice}
                                                                />
                                                            </Form.Item>
                                                        </Flex>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button 
                                        data-test="button-add-branch-office"
                                        onClick={() => add()}
                                        >Agregar Sucursal</Button>
                                    
                                </div>
                            )
                        }}
                </Form.List>



                <Form.Item>
                    <Button 
                        data-test="submit-button"
                        type='primary' 
                        htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </Flex>
    )
}

export default BusinessEdit