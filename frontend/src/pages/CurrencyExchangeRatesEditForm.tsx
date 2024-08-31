import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Typography, InputNumber } from "antd";
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";

function CurrencyExchangeRatesEditForm (): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const [form] = useForm()

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchRate(Number(id));
    } else {
      setIsEditing(false);
    }
  }, [id]);

  const fetchRate = async (id: number) => {
    setLoading(true);
    try {
      const data = await CurrencyExchangeRatesService.getById(id);
      console.log({data})
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Error al consultar tasas de cambio');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (isEditing && id) {
        await CurrencyExchangeRatesService.update(Number(id), values);
        message.success('Tasas de cambio actualizadas correctamente');
      } else {
        await CurrencyExchangeRatesService.create(values);
        message.success('Tasas de cambio registradas exitosamente');
      }
      form.resetFields();
      navigate('/currency-exchange-rates'); // Navigate back to the main page
    } catch (error) {
      message.error('Error al guardar tasas de cambio');
    }
  };

  return (
    <>
        <Typography.Title level={1}>
            { isEditing ? "Editando Tasa de Cambio" : "Registrando Nueva Tasa de Cambio"}

        </Typography.Title>
        <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
            dolarBCVToBs: 0,
            eurosBCVToBs: 0,
            dolarBlackToBs: 0,
            euroBlackToBs: 0,
        }}
        >
        <Form.Item
            label="USD/BS (BCV)"
            name="dolarBCVToBs"
            rules={[{ required: true, message: 'Please input the USD/BS (BCV) rate!' }]}
        >
            <InputNumber 
                min={0}  
                step={0.01}

                formatter={(value) => `${value}`.replace('.', ',')}
                
                parser={(value) => {
                    console.log({value,
                        v: value?.replace(',', '.')
                    })
                    return value
                }}
                />
        </Form.Item>

        <Form.Item
            label="EUR/BS (BCV)"
            name="eurosBCVToBs"
            rules={[{ required: true, message: 'Please input the EUR/BS (BCV) rate!' }]}
        >
            <InputNumber min={0} step={0.01} 
                formatter={(value) => `${value}`.replace('.', ',')}
                    
                parser={(value) => {
                    console.log({value,
                        v: value?.replace(',', '.')
                    })
                    return value
                }}
            />
        </Form.Item>

        <Form.Item
            label="USD/BS (Black)"
            name="dolarBlackToBs"
            // Uncomment if required
            // rules={[{ 
            //     required: true, 
            //     message: 'Please input the USD/BS (Black) rate!'
            // }]}
        >
            <InputNumber min={0} step={0.01}
                formatter={(value) => `${value}`.replace('.', ',')}
                
                parser={(value) => {
                    console.log({value,
                        v: value?.replace(',', '.')
                    })
                    return value
                }}
            />
        </Form.Item>

        <Form.Item
            label="EUR/BS (Black)"
            name="euroBlackToBs"
            // Uncomment if required
            // rules={[{ 
            //     required: true, 
            //     message: 'Please input the EUR/BS (Black) rate!',
            // }]}
        >
            <InputNumber min={0} step={0.01} 
                formatter={(value) => `${value}`.replace('.', ',')}
                
                parser={(value) => {
                    console.log({value,
                        v: value?.replace(',', '.')
                    })
                    return value
                }}
            />
        </Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit">
            {isEditing ? 'Update' : 'Submit'}
            </Button>
        </Form.Item>
        </Form>
    </>
    
  );
};

export default CurrencyExchangeRatesEditForm;