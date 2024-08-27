import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as api from '../util/api'
import * as businessesApi from '../util/businessesApi'
import { Business, BranchOffice } from '../util/types'
import { 
    Button, 
    DatePicker, 
    Divider, 
    Flex, 
    Form, 
    Input, 
    Select, 
    Typography,
    Upload,
    UploadProps,
    message
} from "antd";

import { 
    BusinessFormFields, 
    channelOptions, 
    ContactForm, 
    contactOptions, 
    getBase64, 
    reminderIntervalMap, 
    reminderIntervalOptions, 
    ZONES,
    reminderIntervalMapReverse,
    getPreferredChannelName,
    getPreferredContactType, 
} from './BusinessShared'
import dayjs from "dayjs";

export default function BusinessForm(): JSX.Element {
    const [business, setBusiness] = useState<Business>()
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>()
    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);
    const [people, setPeople] = useState<Person[]>([])

    const [messageApi, contextHolder] = message.useMessage()
    const navigate = useNavigate()



    const [form] = Form.useForm()

    const { businessId } = useParams();

    let isNewTaxPayer = businessId ? false : true
    
    useEffect(() => {
        if(businessId) {
            loadBusinessData(businessId)
        } else {
            console.log("Creating a new tax payer")
        }

        loadEconomicActivities()
        loadPeople()
    }, [])

    async function loadBusinessData(businessId: string){
        let businessData = await api.fetchBusinessById(Number(businessId))
        let branchOffices = await api.fetchBranchOffices(Number(businessId))

        setBusiness(businessData)
        setBranchOffices(branchOffices)

        console.log(JSON.stringify(businessData, null, 2))

        const formInitData ={
            businessName: businessData.businessName,
            dni: businessData.dni,
            economicActivity: businessData.economicActivity.title,

            companyIncorporationDate: dayjs(businessData.companyIncorporationDate),
            companyExpirationDate: dayjs(businessData.companyExpirationDate),
            directorsBoardExpirationDate: dayjs(businessData.directorsBoardExpirationDate),

            preferredContact: getPreferredContactType(businessData),
            preferredChannel: getPreferredChannelName(businessData.preferredChannel),
            sendCalculosTo: getPreferredChannelName(businessData.sendCalculosTo),
            reminderInterval: '',
        }

        if(businessData.reminderInterval) {
            formInitData.reminderInterval = reminderIntervalMapReverse[businessData.reminderInterval]
        }

        if (businessData.owner?.id) {
            formInitData.owner = `${businessData.owner.dni} - ${businessData.owner.firstName} ${businessData.owner.lastName}`;
        }
        
        if (businessData.accountant?.id) {
            formInitData.accountant = `${businessData.accountant.dni} - ${businessData.accountant.firstName} ${businessData.accountant.lastName}`;
        }
        
        if (businessData.administrator?.id) {
            formInitData.administrator = `${businessData.administrator.dni} - ${businessData.administrator.firstName} ${businessData.administrator.lastName}`;
        }

        // the same for accountant and administrator

        form.setFieldsValue(formInitData)
    }

    async function loadEconomicActivities() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async function loadPeople() {
        const peopleData = await api.getPeople()

        // console.log({peopleData})

        setPeople(peopleData)
    }
    
    function showFormData() {
        const formData = form.getFieldsValue()
        console.log({formData})
    }

    // Map preferredChannel and sentCalculosTo to corresponding values
    const channelMapping: { [key: string]: string } = {
        'Teléfono': 'PHONE',
        'Whatsapp': 'WHATSAPP',
        'Correo': 'EMAIL'
    };

    // Map preferredContact to corresponding values
    const contactMapping: { [key: string]: string } = {
        'Administrador': 'ADMIN',
        'Propietario': 'OWNER',
        'Contador': 'ACCOUNTANT'
    }
    

    const onFinish: FormProps<FormFields>['onFinish'] = async (values: FormFields) => {
        try {
            console.log(JSON.stringify(values, null, 2) );
            console.log({branchOffices})
            
            // set up the business data to register
            const businessData: Business = {
                businessName: values.businessName,
                dni: values.dni,
                companyExpirationDate: values.companyExpirationDate,
                companyIncorporationDate: values.companyIncorporationDate,
                directorsBoardExpirationDate: values.directorsBoardExpirationDate,

                preferredChannel: values.preferredChannel,
                sendCalculosTo: values.sendCalculosTo,
                preferredContact: values.preferredContact,
            } 

            // get economic activity id
            const economicActivityObject = economicActivities.find(e => e.title === values?.economicActivity);
            const economicActivityId = economicActivityObject?.id;

            businessData.economicActivityId = economicActivityId

            // get the contacts ids 
            const { 
                owner: ownerString, 
                accountant: accountantString, 
                administrator: administratorString } = values;

            const owner = getSelectedPerson(ownerString)
            const accountant = getSelectedPerson(accountantString)
            const administrator = getSelectedPerson(administratorString)

            if (owner) businessData.ownerPersonId = owner.id
            if (accountant) businessData.accountantPersonId = accountant.id
            if (administrator) businessData.administratorPersonId = administrator.id

            // get the reminder interval id
            businessData.reminderInterval = reminderIntervalMap[values.reminderInterval]

            // get the preferred communications channels
            businessData.preferredChannel = channelMapping[values.preferredChannel]
            businessData.sendCalculosTo = channelMapping[values.sendCalculosTo]
            businessData.preferredContact = contactMapping[values.preferredContact]

            // create the business
            let newBusinessData: Business
            if (businessId) {
                newBusinessData =await api.updateBusinessData(Number(businessId), businessData)
            } else {
                newBusinessData = await api.sendBusinessData(businessData)
            }

            // save Certificate of Incorporation
            console.log("OUTSIDE")
            console.log(values.certificateOfIncorporationUpload)
            if (newBusinessData.id && values?.certificateOfIncorporationUpload?.fileList?.length > 0) {
                console.log("HERE")
                // if there is files to upload
                
                // make up the file to upload
                const coi = {
                    businessId: newBusinessData.id,
                    expirationDate: values.companyExpirationDate,
                    docImages: values.certificateOfIncorporationUpload.fileList.map( f => f.originFileObj)
                }

                // send with businessApi.uploadCertificateOfIncorporation
                const uploadedCoi = await businessesApi.uploadCertificateOfIncorporation(coi)

                console.log({uploadedCoi})

                
            }

            

            console.log({newBusinessData})

            messageApi.open({
                type: 'success',
                content: "Contribuyente guardado exitosamente",
            });

            setTimeout(() => {
                navigate(`/business/${newBusinessData.id}`)
            })
            
        } catch (error) {
            console.log({error})

            let msg = "Hubo un error";
            msg = error.message;
        
            if (error.message === "duplicated dni") {
                messageApi.open({
                type: 'error',
                content: `RIF ya registrado`,
                });
        
                return;
            }
        
            messageApi.open({
                type: 'error',
                content: msg,
            });
        }
    }

    function getSelectedPerson(personString: string): Person | undefined {
        // divide the string and get the dni

        if(!personString) return undefined

        const dni = personString.split(' - ')[0]
        // find the person with that dni 
        const selectedPerson = people?.find( p => p.dni === dni )
        // return that person
        return selectedPerson
    }

    return (
        <>
            {contextHolder}
            <Flex vertical>
                { isNewTaxPayer 
                    ? <Typography.Title level={1}>Nuevo contribuyente</Typography.Title> 
                    : <Typography.Title level={1}>Editar contribuyente</Typography.Title>}

                <Form 
                    form={form} 
                    onFinish={onFinish}>
                    <BusinessBasicInformarionForm 
                        economicActivities={economicActivities}
                    />

                    <BusinessContactInformationForm 
                        people={people}
                    />

                    <BusinessContactPreferenceForm 
                    
                    />

                    <CertificateOfIncorporationForm
                    
                    />
    
                    <Form.Item>
                        <Button 
                            data-test='submit-button'
                            type='primary' htmlType='submit'>Guardar</Button>
                    </Form.Item>

                    {/* <Button onClick={() => showFormData()}>
                        Show form data
                    </Button> */}
                </Form>
            </Flex>
        </>
        
    )
}

function BusinessBasicInformarionForm({economicActivities}): JSX.Element {
    return (
        <>
            <Flex gap='middle'>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "Introduzca la razón social"
                        }
                    ]}
                    label='Razón Social'
                    name='businessName'
                    style={{
                        width: '70%'
                    }}
                >
                    <Input data-test='business-name-input'/>
                </Form.Item>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "Introduzca el RIF"
                        },
                        {
                            pattern: /^[VEJG]-\d{7,8}-\d{1}$/,
                            message: 'Formato de RIF inválido (debe ser, V-12345678-9, E-12345678-9, etc)'
                        }
                    ]}
                    label='Rif'
                    name='dni'
                    style={{
                        width: '30%'
                    }}
                >
                    <Input data-test='business-dni-input'/>
                </Form.Item>
            </Flex>

            <Form.Item
                // it can be normal or special 
                label='Tipo de Contribuyente: '
                name='type'
            >
                <Select
                    showSearch
                    defaultValue={'Normal'}
                    options={[
                        {label: "Especial", value: "Especial"},
                        {lable: "Normal", value: "Normal"}
                    ]}
                />
            </Form.Item>

            <Flex wrap gap="middle">
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

            <Form.Item
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

            <Divider/>
        </>
    )
}

function BusinessContactInformationForm({people}): JSX.Element{
    const form = Form.useFormInstance();

    const peopleOptions = people.map( p => {
        // i need to convert to format that is valid for select

        return {
            label: p.dni + ' - ' + p?.fullName, 
            value: p.dni + ' - ' + p?.fullName,
            key: p.id,
        }
    })

    return (
        <>
            <Typography.Title level={3}>
                Contactos
            </Typography.Title>

            <Flex gap='middle'>
                <Form.Item 
                    name={"owner"}
                    label={"Propietario"}
                    style={{width: '100%'}}
                    rules={[{required: true, message: "Seleccione un propietario"}]}>
                    <Select
                        showSearch
                        options={peopleOptions}
                    />
                </Form.Item>
            </Flex>
                
            <Flex gap='middle'>
                <Form.Item 
                    name={"accountant"}
                    label={"Contador"}
                    style={{width: '80%'}}>
                    <Select
                        showSearch
                        options={peopleOptions}
                    />
                    
                </Form.Item>
                <Button onClick={() => {
                    // take accountant and clear the content
                    form.setFieldsValue({accountant: ''})
                }}>Eliminar</Button>
            </Flex>            
            

            <Flex gap='middle'>
                <Form.Item 
                    name={"administrator"}
                    label={"Administrador"}
                    style={{width: '80%'}}>
                    <Select
                        showSearch
                        options={peopleOptions}
                    />
                    
                </Form.Item>
                <Button onClick={() => {
                    // take accountant and clear the content
                    form.setFieldsValue({administrator: ''})
                }}>Eliminar</Button>
            </Flex>

            <Divider/>
        </>
    )
}


function BusinessContactPreferenceForm(): JSX.Element{

    return (
        <>
            <Typography.Title level={3}>
                Preferencias de comunicación
            </Typography.Title>
            
            <Form.Item<FormFields> 
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
            <Form.Item<FormFields>
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

            <Form.Item<FormFields>
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
            
            <Form.Item<FormFields>
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

            <Divider/>
        
        </>
    )

}

function CertificateOfIncorporationForm(): JSX.Element {

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
			console.log("adding dni")
			// setFileList([...fileList, file]);
			return false;
		},
    }
    return (
        <Flex vertical>
            <Typography.Title level={3}>
                Registro Comercial
            </Typography.Title>

            <Form.Item name={"certificateOfIncorporationUpload"}>
                <Upload {...uploadProps}>
                    <Button>
                        Agregar Imágenes
                    </Button>
                </Upload>
            </Form.Item>

        </Flex>

    )
}