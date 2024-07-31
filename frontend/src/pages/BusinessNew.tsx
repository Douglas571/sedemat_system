import React, { useState, useEffect } from 'react'
import { DatePicker, FormProps, InputNumber, Select, Switch } from 'antd'
import { Form, Input, Button, message, Typography, Space, Flex } from 'antd'
import _ from 'lodash'

import * as api from '../util/api'
import type { Business, EconomicActivity } from '../util/api'
import { BusinessFormFields } from './BusinessShared'


const { Title, Paragraph } = Typography

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type BranchOfficeFormFields = {
    address: string 
    phone: string
}

interface ContactForm {
    firstName: string 
    lastName: string 
    dni: string
    phone: string
    whatsapp: string 
    email: string 
}

// TODO: create the needed classes 
interface FormFields {
    businessName: string
    dni: string
    email: string
    branchOffices: Array<BranchOfficeFormFields>

    owner: ContactForm
    accountant: ContactForm
    administrator: ContactForm

    preferredChannel: string
    sendCalculosTo: string
    preferredContact: string
    reminderInterval: string
}

const contactOptions = [
    {label: "Propietario", value: "Propietario"},
    {lable: "Contador", value: "Contador"},
    {label: "Administrador", value: "Administrador"},
]

const channelOptions = [
    {label: "Teléfono", value: "Teléfono"},
    {lable: "Whatsapp", value: "Whatsapp"},
    {label: "Correo", value: "Correo"},
]

const reminderIntervalOptions = [
    {label: "Una vez al més", value: "Una vez al més"},
    {label: "Cada 3 días", value: "Cada 3 días"},
    {label: "Cada 7 días", value: "Cada 7 días"},
    {lable: "Cada 15 días", value: "Cada 15 días"},
]

const reminderIntervalMap: { [key: string]: number } = {
    "Una vez al més": 30,
    "Cada 3 días": 3,
    "Cada 7 días": 7,
    "Cada 15 días": 15,
}

function BusinessNew(): JSX.Element {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);

    function clearForm(){
        form.setFieldsValue({
            businessName: "",
            dni: "",
            type: "Normal",
            e: false,
            companyIncorporationDate: null,
            companyExpirationDate: null,
            directorsBoardExpirationDate: null,
            economicActivity: "",
            owner: {
                firstName: "",
                lastName: "",
                dni: "",
                phone: "",
                whatsapp: "",
                email: ""
            },
            accountant: {
                firstName: "",
                lastName: "",
                dni: "",
                phone: "",
                whatsapp: "",
                email: ""
            },
            administrator: {
                firstName: "",
                lastName: "",
                dni: "",
                phone: "",
                whatsapp: "",
                email: ""
            },
            branchOffices: [
                {
                    zone: "",
                    address: "",
                    dimensions: "",
                    type: ""
                }
            ]
        });
	}

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    const onFinish: FormProps<FormFields>['onFinish'] = async (values: FormFields) => {
        try {
            console.log(JSON.stringify(values, null, 2) );

            // Early return for testing purposes
            // return;
        
            const economicActivityObject = economicActivities.find(e => e.title === values?.economicActivity);
            const economicActivityId = economicActivityObject?.id;
        
            // Register contacts
            const { owner, accountant, administrator } = values;
        
            // Upload the owner and get the id before sending the business
            const registeredOwner = await api.registerPerson(owner);
            console.log({ registeredOwner });
        
            // Upload the accountant if it exists
            let registeredAccountant;
            if (accountant?.firstName) {
                registeredAccountant = await api.registerPerson(accountant);
                console.log({ registeredAccountant });
            }

            // Upload the administrator if it exists
            let registeredAdministrator;
            if (administrator?.firstName) {
                registeredAdministrator = await api.registerPerson(administrator);
                console.log({ registeredAdministrator });
            }
      
            const newBusiness = {
                ..._.omit(values, ['branchOffices', 'preferredChannel', 'sendCalculosTo', 'preferredContact', 'reminderInterval']),
                economicActivityId,
                ownerPersonId: registeredOwner.id,
                accountantPersonId: registeredAccountant?.id,
                administratorPersonId: registeredAdministrator?.id,
            };
      
            const response = await api.sendBusinessData(newBusiness);
            const businessId = response.id;

            if (!businessId) {
                throw Error("Error al registrar empresa")
            }
      
            // Register branch offices
            values.branchOffices.forEach(async (office) => {
                console.log({ IWillRegisterThisBranchOffice: office });
                const officeToRegister = { ...office, businessId };
                const newOffice = await api.registerBranchOffice(officeToRegister);
                console.log({ registeredOffice: newOffice });
            });
      
            // Create an object called businessContactPreference
            const businessContactPreference: { [key: string]: string } = {};
      
            // Map preferredChannel and sentCalculosTo to corresponding values
            const channelMapping: { [key: string]: string } = {
                'Teléfono': 'PHONE',
                'Whatsapp': 'WHATSAPP',
                'Correo': 'EMAIL'
            };

            // Map preferredContact to corresponding values
            const contactMapping: { [key: string]: string } = {
                'Administrador': 'ADMINISTRATOR',
                'Propietario': 'OWNER',
                'Contador': 'ACCOUNTANT'
            }

            response.preferredChannel = channelMapping[values.preferredChannel]
            response.sendCalculosTo = channelMapping[values.sendCalculosTo]
            response.preferredContact = contactMapping[values.preferredContact]
            response.reminderInterval = reminderIntervalMap[values.reminderInterval]

            console.log("before sending ", JSON.stringify(response, null, 2))
            // Update business with the contacts preference data
            const finalBusiness = await api.updateBusinessData(businessId, response);
            console.log({finalBusiness})
        
            messageApi.open({
                type: 'success',
                content: "Contribuyente guardado exitosamente",
            });
        
            // clearForm() // Uncomment if you have a clearForm function defined
            } catch (error) {
            console.log({ error });
            let msg = "Hubo un error";
            msg = error.message;
        
            if (error.message === "duplicated dni") {
                messageApi.open({
                type: 'error',
                content: `Cédula ya registrada`,
                });
        
                return;
            }
        
            messageApi.open({
                type: 'error',
                content: msg,
            });
        }
    };

    function tipoTerreno(mts2: number): number {
        // Return type 3 if mts2 is greater than or equal to 300
        if (mts2 >= 300) {
            return 3;
        }
    
        // Return type 2 if mts2 is greater than or equal to 50
        if (mts2 >= 50) {
            return 2;
        }
    
        // Return type 1 if mts2 is greater than or equal to 0
        if (mts2 >= 0) {
            return 1;
        }
    
        // Return 0 if none of the conditions are met
        return 0;
    }

    function romanize (num: number): string {
        if (isNaN(num))
            return '';

        let digits = String(+num).split("")
        let key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM", "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC", "","I","II","III","IV","V","VI","VII","VIII","IX"]
        let roman = ""
        let i = 3;

        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;

        return Array(+digits.join("") + 1).join("M") + roman;
    }

    function handleDimensionsChange(officeIndex: number, dimensions: string) {
        // Convert dimensions to a number
        const newDimensions = Number(dimensions);

        // Calculate the new type using tipoTerreno
        const newType = tipoTerreno(newDimensions);

        // Retrieve the current branch offices from the form
        const branchOffices = form.getFieldsValue(['branchOffices']).branchOffices;

        // Update the type of the specific branch office
        if (branchOffices[officeIndex]) {
            branchOffices[officeIndex].type = romanize(newType); // Convert newType to string
        }

        // Update the form with the new branch offices data
        form.setFieldsValue({ branchOffices });
    }

    return (
        <>
            {contextHolder}
            <Title level={2}>
                Nuevo Contribuyente
            </Title>
            
            <Form 
                form={form}
                onFinish={onFinish}
                initialValues={{
                    branchOffices: [
                        {}
                    ],
                    preferredContact: contactOptions[0]?.value,
                    preferredChannel: channelOptions[0]?.value,
                    sendCalculosTo: channelOptions[2]?.value,
                    reminderInterval: reminderIntervalOptions[0]?.value
                }}
            >
                <Flex gap='middle'>
                    <Form.Item<FormFields>
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
                    <Form.Item<FormFields>
                        rules={[
                            {
                                required: true,
                                message: "Introduzca el rif o la cédula"
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
                
                <Space>
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
                </Space>

                <Flex>
                    {/* Define good names */}
                    
                    <Form.Item
                        label='Fecha Constitución: '
                        name='companyIncorporationDate'
                    >
                        <DatePicker data-test="business-constitution-date"/>
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
                


                <Title level={3}>
                    Propietario
                </Title>
                <Space>
                    <Form.Item<FormFields>
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
                    <Form.Item
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
                    <Form.Item
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
                <Form.Item
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

                <Title level={3}>
                    Contador
                </Title>
                <Space>
                    <Form.Item
                        label='Nombre: '
                        name={["accountant", "firstName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Apellido: '
                        name={["accountant", "lastName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Cédula: '
                        name={["accountant", "dni"]}
                    >
                        <Input/>
                    </Form.Item>
                </Space>
                <Form.Item
                    label='Teléfono: '
                    name={["accountant", "phone"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["accountant", "whatsapp"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Correo: '
                    name={["accountant", "email"]}
                >
                    <Input/>
                </Form.Item>

                <Title level={3}>
                    Administrador
                </Title>
                <Space>
                    <Form.Item
                        label='Nombre: '
                        name={["administrator", "firstName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Apellido: '
                        name={["administrator", "lastName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Cédula: '
                        name={["administrator", "dni"]}
                    >
                        <Input/>
                    </Form.Item>
                </Space>
                <Form.Item
                    label='Teléfono: '
                    name={["administrator", "phone"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["administrator", "whatsapp"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Correo: '
                    name={["administrator", "email"]}
                >
                    <Input/>
                </Form.Item>

                <Form.List name='branchOffices'>
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    <Title level={3}>
                                        Sucursales
                                    </Title>
                                    {
                                        fields.map(field => {
                                            return (
                                                <div key={field.name}>
                                                    <span>
                                                        <h4>#{ field.name + 1 } <Button onClick={() => remove(field.name)}>Eliminar</Button></h4>
                                                        
                                                        <Form.Item label="Dirección" name={[field.name, 'address']}>
                                                            <Input data-test={`branch-office-${field.name}-address`}/>
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
                                                                    onChange={(dimensions) => {handleDimensionsChange(field.name, dimensions)}}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item label="Tipo" name={[field.name, 'type']}>
                                                                <Select
                                                                    data-test="branch-office-${index}-zone"
                                                                    showSearch
                                                                    options={[
                                                                        {label: "I", value: "I"},
                                                                        {lable: "II", value: "II"},
                                                                        {label: "III", value: "III"},
                                                                    ]}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item label="Procedencia" name={[field.name, 'origin']}>
                                                                <Select
                                                                    data-test={`branch-office-${field.name}-origin`}
                                                                    showSearch
                                                                    options={[
                                                                        {label: "Propio", value: "Propio"},
                                                                        {lable: "Alquilado", value: "Alquilado"}
                                                                    ]}
                                                                />
                                                            </Form.Item>
                                                        </Flex>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button 
                                        data-test='branch-office-add-button'
                                        onClick={() => add()}>Agregar Sucursal</Button>
                                    {/* <Button onClick={() => console.log({contenido: form.getFieldsValue()})}>Mostrar contenido</Button> */}
                                </div>
                            )
                        }}
                </Form.List>

                <Form.Item>
                    <Button 
                        data-test='submit-button'
                        type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </>
    )
}

export default BusinessNew


const ZONES = [
    { id: 1, label: "ALTA VISTA", value: "ALTA VISTA" },
    { id: 2, label: "AVENDA BELLA VISTA", value: "AVENDA BELLA VISTA" },
    { id: 3, label: "AVENIDA", value: "AVENIDA" },
    { id: 4, label: "AVENIDA BELLA VISTA", value: "AVENIDA BELLA VISTA" },
    { id: 5, label: "BARRIALITO", value: "BARRIALITO" },
    { id: 6, label: "CALLE BOLIVAR", value: "CALLE BOLIVAR" },
    { id: 7, label: "CALLE INDUSTRIA", value: "CALLE INDUSTRIA" },
    { id: 8, label: "CALLE LA PAZ", value: "CALLE LA PAZ" },
    { id: 9, label: "CALLE ZAMORA", value: "CALLE ZAMORA" },
    { id: 10, label: "CARRETERA NACIONAL MORON-CORO", value: "CARRETERA NACIONAL MORON-CORO" },
    { id: 11, label: "CENTRO", value: "CENTRO" },
    { id: 12, label: "CERRO", value: "CERRO" },
    { id: 13, label: "CIRO CALDERA", value: "CIRO CALDERA" },
    { id: 14, label: "CORO", value: "CORO" },
    { id: 15, label: "CUMAREBITO", value: "CUMAREBITO" },
    { id: 16, label: "DELICIAS", value: "DELICIAS" },
    { id: 17, label: "INAVI", value: "INAVI" },
    { id: 18, label: "LA CAÑADA", value: "LA CAÑADA" },
    { id: 19, label: "LAS DELICIAS", value: "LAS DELICIAS" },
    { id: 20, label: "PUENTE PIEDRA", value: "PUENTE PIEDRA" },
    { id: 21, label: "QUEBRADA DE HUTTEN", value: "QUEBRADA DE HUTTEN" },
    { id: 22, label: "SANTA ELENA", value: "SANTA ELENA" },
    { id: 23, label: "SANTA TERESA", value: "SANTA TERESA" },
    { id: 24, label: "SECTOR LAS DELICIAS", value: "SECTOR LAS DELICIAS" },
    { id: 25, label: "TRANSEUNTE", value: "TRANSEUNTE" },
    { id: 26, label: "URBANIZACION CIRO CALDERA", value: "URBANIZACION CIRO CALDERA" }
];