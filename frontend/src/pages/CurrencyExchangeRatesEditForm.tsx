import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Typography, InputNumber, Flex, Card} from "antd";
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";

import CustomInputNumber from "./components/FormInputNumberBs";

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
    <Card
      title={
        (<Typography.Title level={1}>
          { isEditing ? "Editando Tasas de Cambio" : "Registrando Nuevas Tasas de Cambio"}
      </Typography.Title>)
      }
    >
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

        <Flex gap={20}>
        <Form.Item
              label="USD/BS (BCV)"
              name="dolarBCVToBs"
              rules={[{ required: true, message: 'Introduce el cambio de dólares a bolívares (BCV)' }]}
          >
              <CustomInputNumber 
                  min={0}  
                  step={0.01}
                  addonAfter='Bs'
                  decimalSeparator=','
                  />
          </Form.Item>

          <Form.Item
              label="EUR/BS (BCV)"
              name="eurosBCVToBs"
              rules={[{ required: true, message: 'Introduce el cambio de euros a bolívares (BCV)' }]}
          >
              <CustomInputNumber 
                  min={0} 
                  step={0.01} 
                  addonAfter='Bs'
                  decimalSeparator=','
              />
          </Form.Item>
        </Flex>
        

        <Flex gap={20}>
          <Form.Item
              label="USD/BS (Negro)"
              name="dolarBlackToBs"
              // Uncomment if required
              // rules={[{ 
              //     required: true, 
              //     message: 'Please input the USD/BS (Black) rate!'
              // }]}
          >
              <CustomInputNumber 
                addonAfter='Bs'
                min={0}
                step={0.01}
                decimalSeparator=','
              />
          </Form.Item>

          <Form.Item
              label="EUR/BS (Negro)"
              name="euroBlackToBs"
              // Uncomment if required
              // rules={[{ 
              //     required: true, 
              //     message: 'Please input the EUR/BS (Black) rate!',
              // }]}
          >
              <CustomInputNumber 
                addonAfter='Bs'
                min={0}
                step={0.01}
                decimalSeparator=','
              />
          </Form.Item>  
        </Flex>

        <Form.Item>
            <Button type="primary" htmlType="submit">
            {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
        </Form.Item>
        </Form>
    </Card>
    
  );
};

export default CurrencyExchangeRatesEditForm;