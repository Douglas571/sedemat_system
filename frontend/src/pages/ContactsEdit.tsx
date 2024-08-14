import { Flex, Typography, Image, Space, UploadFile, Upload, Form, Input, FormProps, message, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons';

import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'
import { ContactForm, getBase64 } from './BusinessShared';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export default function ContactsView(): JSX.Element {
    const {id} = useParams()

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const [form] = Form.useForm()

    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

    const onFinish: FormProps<ContactForm>['onFinish'] = async (values: ContactForm) => {
        // const formData = form.getFieldsValue() // i don't know why this is not working

        console.log({values})

        const pfpUrl = await uploadPicture()
        console.log({pfpUrl})
        const registeredPerson = await api.registerPerson({...values, profilePictureUrl: pfpUrl});
        console.log({registeredPerson})

    }

    async function uploadPicture (): Promise<string>{
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