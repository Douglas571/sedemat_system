import { Flex, Typography, Image, Space, UploadFile, Upload, Form, Input, FormProps, message, Button, Divider, UploadProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

import {useEffect, useState} from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Person } from 'util/types'
import * as api from 'util/api'
import * as peopleApi from 'util/people'
import { ContactForm, getBase64, urlToFile } from './BusinessShared';



const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export default function ContactsView(): JSX.Element {
    const {contactId} = useParams()
    let [searchParams, setSearchParams] = useSearchParams();
    let redirect = searchParams.get("redirect");

    const [contact, setContact] = useState<Person>()

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const [form] = Form.useForm()
    const navigate = useNavigate()


    const isEditing = contactId ? true : false

    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];


    // METHODS

    useEffect(() => {
        // load contact data if contactId exists
        if (isEditing) {
            loadContactData()
        }
    }, [])

    async function loadContactData() {

        // get the contact 
        const contactData = await api.getPersonById(Number(contactId))

        // get url of pfp
        const pfpUrl: string = contactData.profilePictureUrl || ''
        
        if (pfpUrl) {
            // convert to file
            try {
                const file = await urlToFile(pfpUrl, pfpUrl.split('/')[-1], 'image/png')

                // set file into file list
                setFileList([
                    {
                        uid: String(Date.now()),
                        name: file.name,
                        status: 'done',
                        url: pfpUrl,
                        originFileObj: file,
                    }
                ])
            } catch (error) {
                console.log({error})
            }
        }

        setContact({...contactData})

        // set the data into the form
        form.setFieldsValue({...contactData})
    }

    const onFinish: FormProps<ContactForm>['onFinish'] = async (values: ContactForm) => {
        console.log({values})
        console.log({fileList})
        
        try {
            // url to set in update or register new
            let pfpUrl: string

            // if there is not url in 1th image object, upload image and update pfp
            if (fileList.length > 0 && fileList[0].url) {
                pfpUrl = fileList[0].url
            } else {
                // if not, create new one
                pfpUrl = await uploadPicture()
            }


            // upload the dni
            let dniPictureUrl = contact?.dniPictureUrl
            console.log("Before dni upload")
            if (values.contactDniUpload?.file) {
                console.log("Inside dni upload")
                // load the file and send it with uploadDniPicture
                // get dni url
                const file = values.contactDniUpload.file
                console.log({file})
                dniPictureUrl = await peopleApi.uploadDniPicture(file)
            }

            console.log("After dni upload")

            // upload the rif
            let rifPictureUrl = contact?.rifPictureUrl
            if (values.contactRifUpload?.file) {
                const file = values.contactRifUpload.file
                rifPictureUrl = await peopleApi.uploadRifPicture(file)
            }

            let newPersonData: Person
            // if editing, update person 
            if (isEditing) {
                newPersonData = await api.updatePerson(Number(contactId), 
                {
                    ...values,
                    dniPictureUrl,
                    rifPictureUrl,
                    profilePictureUrl: pfpUrl
                })
            } else {
                // if not, create a new contact
                newPersonData = await api.registerPerson(
                    {
                        ...values,         
                        dniPictureUrl,
                        rifPictureUrl,
                        profilePictureUrl: pfpUrl
                    });
            }

            console.log({newPersonData})

            if (redirect) {
                navigate(redirect)
                return
            }

            navigate(`/contacts/${newPersonData.id}`)
        } catch (error) {
            console.log({error})

            message.error(error.message);
        }
    }

    async function uploadPicture (): Promise<string>{
        if (fileList.length === 0) {
            throw new Error("Seleccione un archivo para foto de contacto");
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
                console.log("File uploaded successfully. URL: ${data.url}")
                return data.url
            } else {
                // message.error('Upload failed');
                console.error("Upload failed")
            }
        } catch (error) {
            // message.error('Upload failed');
            console.error({message: "Upload failed", error})
            throw error
        }
        return ''
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Cargar Foto de Perfil</div>
        </button>
    )

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

    const dniUploadProps: UploadProps = {
        beforeUpload: (file) => {
			console.log("adding dni")
			// setFileList([...fileList, file]);
			return false;
		},
    }

    const rifUploadProps: UploadProps = {
        beforeUpload: (file) => {
			console.log("adding rif")
			// setFileList([...fileList, file]);
			return false;
		},
    }

    return (
        <>
            <Form onFinish={onFinish} form={form}>
                <Typography.Title level={3}>
                    Propietario
                </Typography.Title>
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
                </Space>

                <Flex wrap>
                    <Form.Item
                        rules={[
                            {
                                required: true,
                                message: "El nombre del propietario es requerido"
                            }
                        ]}
                        label='Nombre: '
                        name={"firstName"}
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
                        name={"lastName"}
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
                        name={"dni"}
                    >
                        <Input data-test="owner-dni-input"/>
                    </Form.Item>

                    <Form.Item
                        label='RIF'
                        name={"rif"}
                    >
                        <Input data-test="owner-rif-input"/>
                    </Form.Item>
                </Flex>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "El teléfono del propietario es requerido"
                        }
                    ]}
                    label='Teléfono: '
                    name={"phone"}
                >
                    <Input data-test="owner-phone-input"/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={"whatsapp"}
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
                    name={"email"}
                >
                    <Input data-test="owner-email-input"/>
                </Form.Item>
                
                <Divider/>

                <Typography.Title level={4}>
                    Recaudos
                </Typography.Title>
                <Flex gap={'middle'} wrap>
                    <Flex vertical>
                        <Typography.Title level={5}>
                            Cédula de Identidad
                        </Typography.Title>
                        <Form.Item 
                            name='contactDniUpload'
                            style={{maxWidth: "200px"}}
                        >
                            <Upload
                                {...dniUploadProps}
                            >
                                <Button>
                                    Agregar Imagen de Cédula
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Flex>
                    
                    <Flex vertical>
                        <Typography.Title level={5}>
                            Copia de Rif
                        </Typography.Title>
                        <Form.Item
                            name='contactRifUpload'
                            style={{maxWidth: "200px"}}
                        >
                            <Upload
                                {...rifUploadProps}
                            >
                                <Button>
                                    Agregar Imagen del RIF
                                </Button>
                            </Upload>
                        </Form.Item>
                        
                    </Flex>
                </Flex>
                    

                <Divider/>
                
                <Form.Item>
                    <Button 
                        data-test='submit-button'
                        type='primary' htmlType='submit'>Guardar
                    </Button>
                </Form.Item>
            </Form>
        </>
    )

}