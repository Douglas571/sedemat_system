import React, { useEffect } from 'react';
import { Card, Form, Button, DatePicker, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

import { useSearchParams } from 'react-router-dom';

import * as reportsService from '../services/reportsService';
import dayjs from 'dayjs';

import useAuthentication from '../hooks/useAuthentication';

const ReportsUserActivity = () => {
  const [form] = Form.useForm();
  const { userAuth } = useAuthentication();

  const onFinish = (values) => {
    console.log(values);

    try {


      // reportsService.downloadBusinessesGrossIncomeSummary({ token: userAuth.token, format: 'excel', month: values.period.month() + 1, year: values.period.year() })



    } catch (error) {
      console.error({error})
      alert(error)  
    }
    
  };

  useEffect(() => {
    form.setFieldsValue({ period: dayjs().subtract(1, 'month') })
  }, [])

  return (
    <Card title={
      <Typography.Title level={3}>Reporte de Actividad</Typography.Title>
    }>
      <Form
        form={form}
        name="download"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="periodo"
          name="period"
          rules={[{ required: true, message: 'Ingrese el periodo' }]}
        >
          <DatePicker picker='month'/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<FileExcelOutlined />}>
            Descargar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ReportsUserActivity;
