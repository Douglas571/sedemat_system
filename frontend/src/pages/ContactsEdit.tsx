import { Flex, Typography, Image, Space, UploadFile, Upload, Form, Input, FormProps, message, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

import {useEffect, useState} from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'
import { ContactForm, getBase64, urlToFile } from './BusinessShared';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export default function ContactsView(): JSX.Element {
    const {contactId} = useParams()

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
        const contact = await api.getPersonById(Number(contactId))

        // get url of pfp
        const pfpUrl: string = contact.profilePictureUrl || ''
        
        if (pfpUrl) {
            // convert to file
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
        }

        // set the data into the form
        form.setFieldsValue({...contact})
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


            let newPersonData: Person
            // if editing, update person 
            if (isEditing) {
                newPersonData = await api.updatePerson(Number(contactId), 
                {
                    ...values, 
                    profilePictureUrl: pfpUrl
                })
            } else {
                // if not, create a new contact
                newPersonData = await api.registerPerson(
                    {
                        ...values, 
                        profilePictureUrl: pfpUrl
                    });

            }

            console.log({newPersonData})

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

    async function handleUpload (): Promise<string>{
        if (fileList.length === 0) {
            message.error('No file selected');
            return '';
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

                <Space>
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
                </Space>
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