import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, Switch } from 'antd';
import { IGrossIncome, IGrossIncomeInvoice } from '../../util/types';
import { percentHandler, CurrencyHandler } from '../../util/currency';

import CustomInputNumber from './FormInputNumberBs';

import * as util from '../../util'
    
function EditGrossIncomeModal({
    grossIncome,
    grossIncomeInvoice,

    open,
    onCancel,
    onFinish
}: {
    grossIncome: IGrossIncome,
    grossIncomeInvoice?: IGrossIncomeInvoice,

    open: boolean
    onCancel: () => void
    onFinish: (grossIncome: IGrossIncome) => void
}) {

    let [form] = Form.useForm()

    let shouldChargeWasteCollectionTax = Form.useWatch('chargeWasteCollection', form);

    let amountBs = Form.useWatch('amountBs', form)
    let TCMMVBCV = Form.useWatch('TCMMVBCV', form)
    let minTaxMMVBCV = Form.useWatch('alicuotaMinTaxMMVBCV', form)
    let wasteCollectionTaxMMVBCV = Form.useWatch('wasteCollectionTaxMMVBCV', form)
    let alicuotaTaxPercent = percentHandler(Form.useWatch('alicuotaTaxPercent', form)).divide(100).value

    function handleOk() {
        onFinish({
            ...grossIncome,
            ...form.getFieldsValue(),
            alicuotaTaxPercent
        })
    }

    useEffect(() => {
        form.setFieldsValue({
            ...grossIncome,
            alicuotaTaxPercent: percentHandler(grossIncome.alicuotaTaxPercent).multiply(100).value
        })
    }, [grossIncome])

    useEffect(() => {

        let newWasteCollectionTaxInBs = util.getWasteCollectionTaxInBs(null,                 
            TCMMVBCV,
            wasteCollectionTaxMMVBCV
        )
        let newMinTaxInBs = util.getMinTaxInBs(null,
            TCMMVBCV,
            minTaxMMVBCV
        )

        let taxInBs = util.getGrossIncomeTaxInBs({
            grossIncomeInBs: amountBs,
            alicuota: alicuotaTaxPercent,
            minTaxMMV: minTaxMMVBCV,
            MMVToBs: TCMMVBCV
        })
        
        let totalTaxInBs = taxInBs

        if (shouldChargeWasteCollectionTax) {
            totalTaxInBs = CurrencyHandler(totalTaxInBs).add(newWasteCollectionTaxInBs).value
        }

        form.setFieldsValue({
            wasteCollectionTaxInBs: newWasteCollectionTaxInBs,
            minTaxInBs: newMinTaxInBs,
            totalTaxInBs
        })

    }, [TCMMVBCV, minTaxMMVBCV, wasteCollectionTaxMMVBCV, alicuotaTaxPercent, shouldChargeWasteCollectionTax])

    return <>
        <Modal
            title='Editar Ingreso Bruto'
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
        >
            <Form
                form={form}
            >
                <Form.Item label="Ingresos Brutos" name='amountBs'>
                    <CustomInputNumber
                        style={{ width: '100%' }}
                        addonAfter='Bs'
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>

                <Form.Item label="Tasa de Cambio MMV-BCV" name='TCMMVBCV'>
                    <CustomInputNumber 
                        style={{ width: '100%' }}
                        addonAfter='Bs'
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>

                <Form.Item label="Alicuota" name='alicuotaTaxPercent'>
                    <CustomInputNumber addonAfter="%"
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>

                <Form.Item label="Inpuesto" name='taxInBs'>
                    <CustomInputNumber disabled addonAfter="Bs" 
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>

                <Form.Item label="Minimo Tributario" name='alicuotaMinTaxMMVBCV'>
                    <CustomInputNumber addonAfter="MMV-BCV" 
                        style={{ width: '100%' }}
                        min={0}
                        step={0.0001}
                        
                    />
                </Form.Item>

                <Form.Item label="Minimo Tributario" name='minTaxInBs' >
                    <CustomInputNumber addonAfter="Bs" 
                        disabled

                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>

                <Form.Item label="Cobrar Aseo" name='chargeWasteCollection'>
                    <Switch />
                </Form.Item>

                <Form.Item label="Aseo" name='wasteCollectionTaxMMVBCV'>
                    <CustomInputNumber 
                        addonAfter="MMV-BCV" 
                        disabled={!shouldChargeWasteCollectionTax} 
                        
                        style={{ width: '100%' }}
                        min={0}
                        step={0.0001}
                        
                    />
                </Form.Item>

                <Form.Item label="Inpuesto Aseo" name="wasteCollectionTaxInBs">
                    <CustomInputNumber disabled addonAfter="Bs"
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>

                <Form.Item label="Total" name='totalTaxInBs'>
                    <CustomInputNumber disabled addonAfter="Bs"
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        
                    />
                </Form.Item>
            </Form>
        </Modal>
    </>
}

export default EditGrossIncomeModal;