// crate the branch office form 

import { Button, DatePicker, Divider, Flex, Form, Input, InputNumber, Select, Switch, Typography, Upload } from "antd"
import { useEffect, useState } from "react"

import { ZONES } from "./BusinessShared"
import { Business } from "util/types"

import * as api from 'util/api'
import * as zonationsApi from 'util/zonations'
import * as documentsApi from 'util/documents'
import { BranchOffice } from "util/types"
import { useParams, useNavigate } from "react-router-dom"

// add it to the app router 

interface ZonationRaw {
    key: number
    index: number 
    files: UploadFile[]
}

export default function BranchOfficeForm(): JSX.Element {

    const [form] = Form.useForm<{address: string, type: string}>()

    const [businesses, setBusinesses] = useState<Business[]>()
    const [businessesOptions, setBusinessesOptions] = useState<{value: string, label: string}[]>()

    const [zonations, setZonations] = useState<Map<number, ZonationRaw>>(new Map())

    const { businessId, branchOfficeId } = useParams()
    const navigate = useNavigate()


    useEffect(() => {
        loadBusinesses()

        if (branchOfficeId) {
            console.log(`editing office ${branchOfficeId} in business ${businessId}`)
            // TODO: load business data
            // TODO: load office data
        }
    }, [])

    useEffect(() => {
        console.log({zonations})
    }, [zonations])

    const onFinish: FormProps<FormFields>['onFinish'] = async (values) => {
        try {    
            // set up the branch office data
            console.log(JSON.stringify(values, null, 2) );
            
            // get the business id
            //const businessId: number = getBusinessId(values.business)

            const newOffice: BranchOffice= {
                businessId: businessId,
                address: values.address,
                type: values.type,
                dimensions: values.dimensions,
                isRented: values.isRented
            }

            const registeredOffice = await api.registerBranchOffice(newOffice)
            const {
                id: branchOfficeId
            } = registeredOffice


            if (!branchOfficeId) {
                throw new Error("Error registering branch office")
            }
            // register zonations 
            if (values.zonationDoc?.fileList) {
                const newZonation = await zonationsApi.createZonation({
                    branchOfficeId, 
                    docImages: values.zonationDoc?.fileList})
                console.log({newZonation})
            }
            // register lease docs
            if (values.isRented && values.leaseDoc?.fileList) {
                const newLease = await documentsApi.sendLeaseDocument({
                    branchOfficeId, 
                    expirationDate: values.leaseDocExpirationDate,
                    docImages: values.leaseDoc?.fileList
                })
                console.log({newLease})
            }
            
            if (!values.isRented && values.buildingDoc?.fileList) {
                // register build docs
                const newBuilding = await documentsApi.sendBuildingDocument({
                    branchOfficeId, 
                    expirationDate: values.buildingDocExpirationDate,
                    docImages: values.buildingDoc?.fileList
                })
                console.log({newBuilding})
            }

            // register fire permit
                
            // register sanity permit
            
            navigate(`/business/${businessId}`)
        } catch (error) {
            console.error('Error:', error);
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
        <>
        <Form 
            form={form}
            onFinish={onFinish}
        >
            <Typography.Title level={3}>
                Sucursales
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

            <Form.Item label="Dirección" name='address'
                rules={[{ required: true }]}
            >
                <Input data-test={`branch-office-address`}/>
            </Form.Item>

            <Flex gap={"small"}>
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
                
                <Form.Item label="Es Alquilado?" name='isRented'>
                    <Switch 
                        checkedChildren="SÍ"
                        unCheckedChildren="NO"/>
                </Form.Item>
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
                    type='primary' htmlType='submit'>Guardar</Button>
            </Form.Item>
        </Form>
        
        </>
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
                gap='middle'
                style={{ display: isRented ? "" : "none"}}
            >
                <Form.Item 
                    name='leaseDocExpirationDate'
                    label="Fecha de Vencimiento"
                >
                    <DatePicker 
                        data-test="branch-office-leaseDocExpirationDate-input"
                    />
                </Form.Item>
                <Form.Item 
                    name='leaseDoc'
                    label="Contrato de Arrendamiento"
                    
                >
                    <Upload key="leaseDoc"
                        {...LeaserDocProps}
                    >
                        <Button>Agregar</Button>
                    </Upload>

                    
                </Form.Item>
                
            </Flex>

            {/* Building Doc */}
            <Flex 
                gap='middle'
                style={{ display: isRented ? "none" : ""}}
            >
                <Form.Item 
                    name='buildingDocExpirationDate'
                    label="Fecha de Vencimiento"
                >
                    <DatePicker 
                        data-test="branch-office-buildingDocExpirationDate-input"
                    />
                </Form.Item>
                <Form.Item 
                    name='buildingDoc'
                    label="Inmueble"
                >
                    <Upload key="buildingDoc"
                        {...BuildingDocProps}
                    >
                        <Button>Agregar</Button>
                    </Upload>
                </Form.Item>

                
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
        <Form.Item 
            name='zonationDoc' 
            label="Zonación">
            <Upload
                {...ZonificacionDocProps}
            >
                
                <Button>Agregar Zonificación</Button>
            </Upload>
        </Form.Item>
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
            <Flex gap='middle'>
                <Form.Item 
                        name='firefighterDocExpirationDate'
                        label="Fecha de Vencimiento"
                    >
                        <DatePicker 
                            data-test="branch-office-leaseDocExpirationDate-input"
                        />
                </Form.Item>
                <Form.Item label="Permiso de Bomberos"
                    name='firefighterPermitDoc'
                >
                    <Upload {...FirefighterPermitsUploadProps}>
                        <Button>Agregar</Button>
                    </Upload>
                </Form.Item>
                
            </Flex>
            {/* Sanitary Permit */}
            <Flex gap='middle'>
                <Form.Item 
                        name='sanitaryDocExpirationDate'
                        label="Fecha de Vencimiento"
                    >
                        <DatePicker 
                            data-test="branch-office-leaseDocExpirationDate-input"
                        />
                </Form.Item>
                <Form.Item label="Permiso Sanitario"
                    name='sanitaryPermitDoc'
                >
                    <Upload {...SanitaryPermitsUploadProps}>
                        <Button>Agregar</Button>
                    </Upload>
                </Form.Item>
                
            </Flex>
        
        
        </>
    )
}