import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { Button, DatePicker, Divider, Flex, Form, Input, InputNumber, Select, Switch, Typography, Upload, Checkbox, Card } from "antd"
import { UploadFile, FormProps } from "antd"

import { ZONES } from "./BusinessShared"
import { Business, BranchOffice, CurrencyExchangeRate } from '../util/types'

import * as api from 'util/api'
import * as zonationsApi from 'util/zonations'
import * as documentsApi from 'util/documents'
import * as permitApi from 'util/permitdocs'
import currencyExchangeRatesService from 'services/CurrencyExchangeRatesService'
import useAuthentication from "hooks/useAuthentication"

// add it to the app router 

interface ZonationRaw {
    key: number
    index: number 
    files: UploadFile[]
}

export default function BranchOfficeForm(): JSX.Element {

    const [form] = Form.useForm<{address: string, type: string}>()

    const [businesses, setBusinesses] = useState<Business[]>()
    const [branchOffice, setBranchOffice] = useState<BranchOffice>()
    const [businessesOptions, setBusinessesOptions] = useState<{value: string, label: string}[]>()

    const [zonations, setZonations] = useState<Map<number, ZonationRaw>>(new Map())

    const [loading, setLoading] = useState(false);
    

    const { businessId, branchOfficeId } = useParams()
    const isEditing = !!branchOfficeId
    const navigate = useNavigate()

    const {userAuth} = useAuthentication()


    function showFormData() {
        console.log({formValues: form.getFieldsValue()})
    }

    useEffect(() => {
        //loadBusinesses()

        if (branchOfficeId) {
            console.log(`editing office ${branchOfficeId} in business ${businessId}`)
            // TODO: load business data
            // TODO: load office data
            loadBranchOffice()
        }

        
    }, [])

    interface FormFields {
        nickname: string
        address: string
        type: string
        dimensions: number
        isRented: boolean
        chargeWasteCollection: boolean
    }
    
    const onFinish: FormProps<FormFields>['onFinish'] = async (values) => {
        try {    
            setLoading(true)
            // set up the branch office data
            console.log(JSON.stringify(values, null, 2) );
            
            // get the business id
            //const businessId: number = getBusinessId(values.business)

            const newOffice: BranchOffice= {
                ...values,
                businessId: Number(businessId),
                nickname: values.nickname,
                address: values.address,
                type: values.type,
                dimensions: values.dimensions,
                isRented: values.isRented,
                chargeWasteCollection: values.chargeWasteCollection
            }

            let newOfficeData
            if (isEditing && branchOfficeId) {
                newOfficeData = await api.updateBranchOffice(Number(branchOfficeId), newOffice, userAuth.token)
            } else {
                newOfficeData = await api.registerBranchOffice(newOffice, userAuth.token)
            }

            console.log({newOfficeData})

            const {
                id: receiveBranchOfficeId
            } = newOfficeData


            if (!receiveBranchOfficeId) {
                throw new Error("Error registering branch office")
            }

            // register zonations 
            if (values.zonationDoc?.fileList) {
                const newZonation = await zonationsApi.createZonation({
                    branchOfficeId: receiveBranchOfficeId, 
                    docImages: values.zonationDoc?.fileList})
                console.log({newZonation})
            }
            // register lease docs
            if (values.isRented && values.leaseDoc?.fileList) {
                console.log("sending lease docs")
                const newLease = await documentsApi.sendLeaseDocument({
                    branchOfficeId: receiveBranchOfficeId, 
                    expirationDate: values.leaseDocExpirationDate,
                    docImages: values.leaseDoc?.fileList
                })
                console.log({newLease})
            }
            
            if (!values.isRented && values.buildingDoc?.fileList) {
                // register build docs
                const newBuilding = await documentsApi.sendBuildingDocument({
                    branchOfficeId: receiveBranchOfficeId, 
                    expirationDate: values.buildingDocExpirationDate,
                    docImages: values.buildingDoc?.fileList
                })
                console.log({newBuilding})
            }

            // register fire permit
            if(values.firefighterDocExpirationDate) {
                const newFireFighterPermit = await permitApi.sendPermit({
                    branchOfficeId: String(receiveBranchOfficeId),
                    expirationDate: values.firefighterDocExpirationDate,
                    type: 'FIRE',
                    docImages: values.firefighterPermitDoc?.fileList?.map( file => file.originFileObj)
                })
            }

            // register sanity permit
            if(values.sanitaryDocExpirationDate) {
                const newFireFighterPermit = await permitApi.sendPermit({
                    branchOfficeId: String(receiveBranchOfficeId),
                    expirationDate: values.sanitaryDocExpirationDate,
                    type: 'HEALTH',
                    docImages: values.sanitaryPermitDoc?.fileList?.map( file => file.originFileObj)
                })
            }
            
            
            navigate(`/business/${businessId}`)
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false)
        }
    };

    function getBusinessId(businessString: string): number {
        const [dni, businessName] = businessString.split(' | ')

        const business = businesses?.find((business) => business.dni === dni && business.businessName === businessName)

        return business.id
    }

    async function loadBusinesses() {
        // WARNING: It fetch all business, but the spelling is wrong, ok?
        const businessesData = await api.fetchBusiness()
        setBusinesses(businessesData)
        console.log({businessesData})
        setBusinessesOptions(businessesData.map((business) => (
            {
                value: business.dni + " | " + business.businessName, 
                label: business.dni + " | " + business.businessName
            }
        )))
    }

    async function loadBranchOffice() {
        // get the office by id
        const officeData = await api.getBranchOfficeById(branchOfficeId)

        if(!officeData) {
            throw new Error("Branch office not found")
        }
        // set the office data in the useState
        setBranchOffice(officeData)
        // set the office data in the form
        form.setFieldsValue({
            ...officeData,
            nickname: officeData.nickname,
            address: officeData.address,
            type: officeData.type,
            dimensions: officeData.dimensions,
            isRented: officeData.isRented,
            chargeWasteCollection: officeData.chargeWasteCollection
        })
    }

    const isRented = Form.useWatch((values) => {
        console.log({values})
        return values.isRented
    }, form)

    function handleDimensionsChange(dimensions: string) {
        // Convert dimensions to a number
        const newDimensions = Number(dimensions);
    
        // Calculate the new type using tipoTerreno
        const newType = tipoTerreno(newDimensions);
    
        // Retrieve the current branch offices from the form
        form.setFieldsValue({type: romanize(newType)});
    }

    return (
        <Card>
        <Form 
            form={form}
            onFinish={onFinish}
        >
            <Typography.Title level={1}>
                { isEditing ? "Editando Sede" : "Nueva Sede"}
            </Typography.Title>

            {/* <Form.Item 
                name={"business"}
                label={"Empresa"}
                style={{width: '100%'}}
                rules={[{required: true, message: "Seleccione una empresa"}]}>
                <Select
                    showSearch
                    options={businessesOptions}
                />
            </Form.Item> */}

            <Form.Item label="Nombre Clave" name='nickname'
                rules={[{ required: true }]}
            >
                <Input data-test={`branch-office-nickname`}/>
            </Form.Item>

            <Form.Item label="Dirección" name='address'
                rules={[{ required: true }]}
            >
                <Input data-test={`branch-office-address`}/>
            </Form.Item>

            <Flex gap={"small"} wrap>
                <Flex>
                    <Form.Item 
                        label="Dimensiones (m2)" 
                        name='dimensions'
                    >
                        <InputNumber
                            min={0}
                            data-test={`branch-office-dimensions`}
                            onChange={(dimensions) => {handleDimensionsChange(dimensions)}}
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Tipo" 
                        name='type'
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
                </Flex>

                <Flex align="center">
                    <Form.Item name="isActive" label="Activo">
                        <Switch checkedChildren="SI" unCheckedChildren="NO"/>
                    </Form.Item>
                    
                    <Form.Item label="Es Alquilado" name='isRented'>
                        <Switch 
                            checkedChildren="SI"
                            unCheckedChildren="NO"/>
                    </Form.Item>

                    <Form.Item
                        name="chargeWasteCollection"
                        label="Cobrar Aseo Urbano"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="SI"
                            unCheckedChildren="NO"/>
                    </Form.Item>
                </Flex>
            </Flex>

            

            {/* Origin */}
            <OriginUploadControls isRented={isRented} />

            
            {/* Permissions Doc */}
            <PermissionsControls />

            {/* Zonation Doc */}
            <ZonationDocControls/>

            <Form.Item>
                <Button 
                    data-test='submit-button'
                    type='primary' 
                    htmlType='submit'
                    loading={loading}
                    disabled={loading}
                >Guardar</Button>
            </Form.Item>
        </Form>
        
        {/* <Button onClick={() => showFormData()}>
            show data
        </Button> */}
        </Card>
    )
}

// function SingleOfficeForm():
function OriginUploadControls({isRented}): JSX.Element {
    const LeaserDocProps: UploadProps = {
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
        beforeUpload: (file) => {
			return false;
		},
        multiple: true,
    }

    return (
        <>
            {/* Lease Doc */}
            <Flex 
                style={{ display: isRented ? "" : "none"}}
                vertical
            >
                <Typography.Title level={4}>Contrato de Arrendamiento</Typography.Title>
                <Flex wrap>
                    <Form.Item 
                        name='leaseDocExpirationDate'
                        label="Fecha de Vencimiento"
                        style={{ marginRight: "20px" }}
                    >
                        <DatePicker 
                            data-test="branch-office-leaseDocExpirationDate-input"
                        />
                    </Form.Item>
                    <Form.Item 
                        name='leaseDoc'
                        // label="Contrato de Arrendamiento"
                        
                    >
                        <Upload key="leaseDoc"
                            {...LeaserDocProps}
                        >
                            <Button>Agregar Imágenes</Button>
                        </Upload>

                        
                    </Form.Item>
                </Flex>
            </Flex>

            {/* Building Doc */}
            <Flex 
                style={{ display: isRented ? "none" : ""}}
                vertical
            >
                <Typography.Title level={4}>Inmueble</Typography.Title>
                <Flex wrap>
                    <Form.Item 
                        name='buildingDocExpirationDate'
                        label="Fecha de Vencimiento"
                        style={{ marginRight: "20px" }}

                    >
                        <DatePicker 
                            data-test="branch-office-buildingDocExpirationDate-input"
                        />
                    </Form.Item>
                    <Form.Item 
                        name='buildingDoc'
                        // label="Inmueble"
                    >
                        <Upload key="buildingDoc"
                            {...BuildingDocProps}
                        >
                            <Button>Agregar Imágenes</Button>
                        </Upload>
                    </Form.Item>
                </Flex>
                

                
            </Flex>
        
        </>
    )
}

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

function ZonationDocControls(): JSX.Element {
    const ZonificacionDocProps: UploadProps = {
        onChange: (args) => {
            console.log({AddingZonificacion: args})
        },
        beforeUpload: (file) => {
            return false
        }
    }

    return (
        <Flex wrap vertical>
            <Typography.Title level={4}>
                Zonificación
            </Typography.Title>
            <Form.Item 
                name='zonationDoc' 
                // label="Zonación"
            >
                <Upload
                    {...ZonificacionDocProps}
                >
                    <Button>Agregar Imágenes</Button>
                </Upload>
            </Form.Item>
        </Flex>
            
    )
}
function PermissionsControls(): JSX.Element {

    const FirefighterPermitsUploadProps: UploadProps = {
        onChange: (args) => {
            console.log({AddingZonificacion: args})
        },
        beforeUpload: (file) => {
            return false
        }
    }

    const SanitaryPermitsUploadProps: UploadProps = {
        onChange: (args) => {
            console.log({AddingZonificacion: args})
        },
        beforeUpload: (file) => {
            return false
        }
    }

    return (
        <>
        
            {/* Firefighter Permit */}
            <Flex vertical>
                <Typography.Title level={4}>
                    Permiso de Bomberos
                </Typography.Title>
                <Flex wrap>
                    <Form.Item 
                            name='firefighterDocExpirationDate'
                            label="Fecha de Vencimiento"
                            style={{ marginRight: "20px" }}

                        >
                            <DatePicker 
                                data-test="branch-office-leaseDocExpirationDate-input"
                            />
                    </Form.Item>
                    <Form.Item 
                        // label="Permiso de Bomberos"
                        name='firefighterPermitDoc'
                    >
                        <Upload {...FirefighterPermitsUploadProps}>
                            <Button>Agregar Imágenes</Button>
                        </Upload>
                    </Form.Item>
                    
                </Flex>
            </Flex>
                
            {/* Sanitary Permit */}
            <Flex vertical>
                <Typography.Title level={4}>
                    Permiso Sanitario
                </Typography.Title>
                <Flex wrap>
                    <Form.Item 
                            name='sanitaryDocExpirationDate'
                            label="Fecha de Vencimiento"
                            style={{ marginRight: "20px" }}

                        >
                            <DatePicker 
                                data-test="branch-office-leaseDocExpirationDate-input"
                            />
                    </Form.Item>
                    <Form.Item 
                        // label="Permiso Sanitario"
                        name='sanitaryPermitDoc'
                    >
                        <Upload {...SanitaryPermitsUploadProps}>
                            <Button>Agregar Imágenes</Button>
                        </Upload>
                    </Form.Item>
                    
                </Flex>
            </Flex>
            
        
        
        </>
    )
}