import React, { useEffect } from 'react';
import { Modal, Form, InputNumber } from 'antd';

import CustomInputNumber from './FormInputNumberBs';

function EditFormPriceModal({
    open,
    onCancel,
    onFinish,

    formPriceBs
}: {
    open: boolean,
    onCancel: () => void,
    onFinish: (formPriceBs: number) => void,
    formPriceBs: number
}): JSX.Element {

    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({ formPriceBs })
    }, [formPriceBs])

    const handleOk = () => {

        let newFormPrice = form.getFieldValue('formPriceBs')
        onFinish(newFormPrice)
    }

    const handleCancel = () => {
        form.setFieldsValue({formPriceBs})
        onCancel()
    }

    return (
        <Modal
            title="Editar Precio de Formulario"
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
        >
            <Form form={form}>
                <Form.Item label="Precio" name='formPriceBs'>
                    <CustomInputNumber
                         style={{ width: '100%' }}
                         addonAfter='Bs'
                         min={0}
                         step={0.01}
                         
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditFormPriceModal;