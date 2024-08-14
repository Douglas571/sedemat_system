import React, { useState, useEffect } from 'react'
import { 
    DatePicker, 
    FormProps, 
    InputNumber, 
    Select,
    Form, 
    Input, 
    Button, 
    message, 
    Typography, 
    Space, 
    Flex,
    Image,
    Upload,
    Switch,
    Divider,
} from 'antd'
import type { 
    GetProp, 
    UploadFile, 
    UploadProps 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash'

import * as api from '../util/api'
import type { 
    Business, 
    EconomicActivity, 
    Person
} from '../util/api'
import { 
    BusinessFormFields, 
    channelOptions, 
    ContactForm, 
    contactOptions, 
    getBase64, 
    reminderIntervalMap, 
    reminderIntervalOptions, 
    ZONES
} from './BusinessShared'
import { json } from 'react-router-dom';



const { Title, Paragraph } = Typography

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type BranchOfficeFormFields = {
    address: string 
    phone: string
}

// TODO: create the needed classes 
interface FormFields {
    businessName: string
    dni: string
    email: string
    branchOffices: Array<BranchOfficeFormFields>

    owner: string
    accountant: string
    administrator: string

    preferredChannel: string
    sendCalculosTo: string
    preferredContact: string
    reminderInterval: string
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
            // console.log(JSON.stringify(values, null, 2) );

            // Early return for testing purposes
            // return;
        
            const economicActivityObject = economicActivities.find(e => e.title === values?.economicActivity);
            const economicActivityId = economicActivityObject?.id;
        
            // Register contacts
            const { 
                owner: ownerString, 
                accountant: accountantString, 
                administrator: administratorString } = values;

            const owner = getSelectedPerson(ownerString)
            const accountant = getSelectedPerson(accountantString)
            const administrator = getSelectedPerson(administratorString)
        
            const newBusiness = {
                ..._.omit(values, [
                    'branchOffices', 
                    'preferredChannel', 
                    'sendCalculosTo', 
                    'preferredContact', 
                    'reminderInterval',
                    'owner',
                    'accountant',
                    'administrator'
                ]),
                economicActivityId,
                // : owner.id,
                // accountantPersonId: registeredAccountant?.id,
                // administratorPersonId: registeredAdministrator?.id,
            };

            if (owner) newBusiness.ownerPersonId = owner.id
            if (accountant) newBusiness.accountantPersonId = accountant.id
            if (administrator) newBusiness.administratorPersonId = administrator.id

            console.log({newBusiness})

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


    function showFormData() {
        const formData = form.getFieldsValue()
        console.log({formData})
    }

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([])

    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

    function handleBranchOfficesUpdate(newBranchOfficeData) {
        console.log({newBranchOfficeData})
    }

    const [people, setPeople] = useState<api.Person[]>()
    const [peopleOptions, setPeopleOptions] = useState()

    useEffect(() => {
        loadPeople()
    }, [])

    async function loadPeople() {
        const peopleData = await api.getPeople()

        console.log({peopleData})

        setPeople(peopleData)

        const po = peopleData.map( p => {
            // i need to convert to format that is valid for select

            return {
                label: p.dni + ' - ' + p?.fullName, 
                value: p.dni + ' - ' + p?.fullName,
                key: p.id,
            }
        })

        console.log({po})

        setPeopleOptions(po)
    }

    function getSelectedPerson(personString: string): Person | undefined {
        // divide the string and get the dni
        const dni = personString.split(' - ')[0]
        // find the person with that dni 
        const selectedPerson = people?.find( p => p.dni === dni )
        // return that person
        return selectedPerson
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

                <Divider/>

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

                <PropietaryPickerForm
                    peopleOptions={peopleOptions}
                />

                <Divider/>

                <BranchOfficeForm
                    onUpdate={handleBranchOfficesUpdate}
                />

                <Form.Item>
                    <Button 
                        data-test='submit-button'
                        type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>

                <Button onClick={() => showFormData()}>
                    Show form data
                </Button>
            </Form>
        </>
    )
}

export default BusinessNew



function PropietaryPickerForm({peopleOptions}): JSX.Element{

    return (
        <>
            <Title level={3}>
                Contactos
            </Title>

            <Form.Item 
                name={"owner"}
                label={"Propietario"}>
                <Select
                    showSearch
                    options={peopleOptions}
                />
            </Form.Item>

            <Form.Item 
                name={"accountant"}
                label={"Contador"}>
                <Select
                    showSearch
                    options={peopleOptions}
                />
            </Form.Item>

            <Form.Item 
                name={"administrator"}
                label={"Administrador"}>
                <Select
                    showSearch
                    options={peopleOptions}
                />
            </Form.Item>
        </>
    )
}
/*

when files change, assign the fileList to the corresponding key, and update the index

listOfFiles [
    {
        key: string // "unique"
        index: int // "variable"
        files: [
            // here goes the files
        ]
    }
]

uploading the branch office
get the id
upload zonification images in a formData with branhc office id 

*/


interface DocImage {

}

interface ZonationRaw {
    key: number
    index: number 
    files: UploadFile[]
}

function BranchOfficeForm({onUpdate}): JSX.Element {
    const form = Form.useFormInstance()
    const [zonations, setZonations] = useState<Map<number, ZonationRaw>>(new Map())

    const branchOffices = Form.useWatch((values) => {
        return values.branchOffices
    })

    function handleUpdate() {
        let branchOffices = form.getFieldsValue()?.branchOffices

        console.log({submitingBranchOffices: branchOffices})

        branchOffices = branchOffices.map((office, index) => {
            // get the zonation that has the same index than branchOffice

            let z 
            zonations.forEach( zonation => {
                console.log({zonationHere: zonation, index})
                if (zonation?.index == index){
                    console.log("here")
                    z = zonation
                }
            })


            // return the new branch office with zonation files
            return {
                ...office,
                zonation: z
            }
        })

        onUpdate(branchOffices)
    }

    function getRentedStatus(index: number): boolean {
        if (!branchOffices) {
            return false 
        }

        return branchOffices[index]?.isRented
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

    useEffect(() => {
        console.log({zonations})
    }, [zonations])
    
    const ZonificacionDocProps: UploadProps = {
        onChange: (args) => {
            console.log({AddingZonificacion: args})
        },
        beforeUpload: (file) => {
            return false
        }
    }

    function getFileList({key, index}: { key: number, index: number}) {
        const fileList = zonations.get(key)?.files

        if(!fileList) {
            return []
        }

        return fileList
    }

    function handleFileChange({files, key, index}: ZonationRaw) {
        console.log({files, key, index})

        zonations.set(key, {files, key, index})
        setZonations(zonations)
    }

    function removeFilesFrom({key, newFields}: {key: number, newFields: Array<{ name: number, key: number}>}) {
        console.log({deletingFilesFrom: key})

        zonations.delete(key)

        // update all fields

        console.log({zonationsBefore: zonations})
        // for each item in newfields
        newFields.forEach( field => {
            const key = field.key 
            const index = field.name 

            const zonation = zonations.get(key)
            console.log({zonation, index, key})

            // it doesn't work because index keep being the same as before removing

            if (!zonation) return false

            const newZonation = {...zonation, index}

            console.log({previousIndex: zonation.index, newIndex: index})
            zonations.set(key, newZonation)
        })
        console.log({zonationsAfterRemoving: zonations})

            // get the key
            // get the update the index with the new field index


        setZonations(zonations)
    }

    const LeaserDocProps: UploadProps = {
        // onPreview: async (file: UploadFile) => {
        //     if (!file.url && !file.preview) {
        //         file.preview = await getBase64(file.originFileObj as FileType);
        //     }
        
        //     setPreviewImage(file.url || (file.preview as string));
        //     setPreviewOpen(true);
        // },
        // onChange: (args) => {
        //     console.log({onChangeArgs: args})
        //     // { fileList: newFileList }
        //     // setFileList(newFileList)
        // },
        beforeUpload: (file) => {
            console.log("adding files")
            // setFileList([...fileList, file]);
            console.log({file})
			return false;
		},
        multiple: true,
		//fileList,
    }
    
    const BuildingDocProps: UploadProps = {
        // onPreview: async (file: UploadFile) => {
        //     if (!file.url && !file.preview) {
        //         file.preview = await getBase64(file.originFileObj as FileType);
        //     }
        
        //     setPreviewImage(file.url || (file.preview as string));
        //     setPreviewOpen(true);
        // },
        // onChange: (args) => {
        //     console.log({onChangeArgs: args})
        //     // { fileList: newFileList }
        //     // setFileList(newFileList)
        // },
        beforeUpload: (file) => {
            console.log("adding files")
            // setFileList([...fileList, file]);
            console.log({file})
			return false;
		},
        multiple: true,
		//fileList,
    }

    function showFiles(key: number) {
        console.log({key, values: zonations.get(key)})
    }

    return (
        <>
        <Button onClick={handleUpdate}>Show update</Button>
        <Form.List name='branchOffices'>
                {(fields, { add, remove }) => {
                    return (
                        <div>
                            <Title level={3}>
                                Sucursales
                            </Title>
                            {JSON.stringify(branchOffices)}
                            {
                                fields.map((field, index) => {
                                    return (
                                        <div key={field.name}>
                                            {JSON.stringify(fields, null, 2)}
                                            <span key={field.key}>
                                                <Flex gap={"middle"} align='center'>
                                                    <h4>#{ field.name + 1 }</h4>
                                                    <Button onClick={() => {
                                                        const key = field.key
                                                        remove(field.name)
                                                        removeFilesFrom({key, newFields: fields})
                                                        
                                                    }}>
                                                        Eliminar
                                                    </Button>
                                                </Flex>

                                                <Button onClick={() => showFiles(field.key)}>
                                                    show files
                                                </Button>
                                                    
                                                
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

                                                    <Form.Item 
                                                        label="Dimensiones (m2)" 
                                                        name={[field.name, 'dimensions']} 
                                                        style={{width: "300px"}} 
                                                    >
                                                        <InputNumber
                                                            data-test={`branch-office-${field.name}-dimensions`}
                                                            onChange={(dimensions) => {handleDimensionsChange(field.name, dimensions)}}
                                                        />
                                                    </Form.Item>

                                                    <Form.Item 
                                                        label="Tipo" 
                                                        name={[field.name, 'type']}
                                                        style={{width: "100px"}} 
                                                    >
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

                                                    <Form.Item label="Procedencia" name={[field.name, 'origin']}
                                                        style={{width: "240px"}} 
                                                    >
                                                        <Select
                                                            data-test={`branch-office-${field.name}-origin`}
                                                            showSearch
                                                            options={[
                                                                {label: "Propio", value: "Propio"},
                                                                {lable: "Alquilado", value: "Alquilado"}
                                                            ]}
                                                        />
                                                    </Form.Item>

                                                    <Flex vertical>
                                                        <Form.Item label="Es Alquilado?" name={[field.name, 'isRented']}>
                                                            <Switch 
                                                                checkedChildren="SÍ"
                                                                unCheckedChildren="NO"/>
                                                        </Form.Item>

                                                        <Form.Item>
                                                            <Upload
                                                                key={field.key}
                                                                {...ZonificacionDocProps}
                                                                onChange={
                                                                    (args) => handleFileChange({
                                                                        files: args.fileList, 
                                                                        key: field.key,
                                                                        index
                                                                    })
                                                                }
                                                            >
                                                                
                                                                <Button>Agregar Zonificación</Button>
                                                            </Upload>
                                                        </Form.Item>

                                                        <Form.Item 
                                                            name="leaseDoc"
                                                            style={{ display: getRentedStatus(Number(field.name)) ? "block" : "none"}}
                                                        >
                                                            <Upload key="leaseDoc"
                                                                {...LeaserDocProps}
                                                            >
                                                                <Button>Agregar Contrato de Arrendamiento</Button>
                                                            </Upload>
                                                        </Form.Item>

                                                        <Form.Item 
                                                            name="buildDoc"
                                                            style={{ display: getRentedStatus(Number(field.name)) ? "none" : "block"}}
                                                        >
                                                            <Upload key="buildingDoc"
                                                                {...BuildingDocProps}
                                                            >
                                                                <Button>Agregar Documentación de Inmueble</Button>
                                                            </Upload>
                                                        </Form.Item>
                                                    </Flex>
                                                </Flex>
                                            </span>
                                            <Divider></Divider>
                                        </div>
                                    )
                                })
                            }
                            
                            <Button 
                                data-test='branch-office-add-button'
                                onClick={() => add()}>Agregar Sucursal</Button>
                        </div>
                    )
                }}
            </Form.List>
        </>
    )
}

// function SingleOfficeForm():

function tipoTerreno(mts2: number): number {
    // Return type 3 if mts2 is greater than or equal to 300
    if (mts2 > 300) {
        return 3;
    }

    // Return type 2 if mts2 is greater than or equal to 50
    if (mts2 > 50) {
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