import React from 'react';
import { Card, Form, Button, DatePicker, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

import { useSearchParams } from 'react-router-dom';

import * as reportsService from '../services/reportsService';
import dayjs from 'dayjs';

import useAuthentication from '../hooks/useAuthentication';

const DownloadPage = () => {
  const [form] = Form.useForm();
  const { userAuth } = useAuthentication();

  const onFinish = (values) => {
    console.log(values);

    try {
      reportsService.downloadBusinessesGrossIncomeSummary({ token: userAuth.token, format: 'excel', month: values.period.month() + 1, year: values.period.year() })
    } catch (error) {
      console.error({error})
      alert(error)  
    }
    
    };

  return (
    <Card title={
      <Typography.Title level={3}>Relaciones de declaraciones de IVA</Typography.Title>
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
          rules={[{ required: true, message: 'Ingrese un periodo' }]}
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

export default DownloadPage;
