import React, { useEffect } from 'react';
import { Card, Form, Button, DatePicker, Typography, Flex } from 'antd';
import { FileExcelOutlined, PlusOutlined } from '@ant-design/icons';

import { useSearchParams } from 'react-router-dom';

import * as userReportsService from '../services/userReportsService';
import dayjs from 'dayjs';

import useAuthentication from '../hooks/useAuthentication';

const ReportsUserActivity = () => {
  const [form] = Form.useForm();
  const { userAuth } = useAuthentication();

  const onFinish = async (values) => {
    try {
      // reportsService.downloadBusinessesGrossIncomeSummary({ token: userAuth.token, format: 'excel', month: values.period.month() + 1, year: values.period.year() })
      let report = await userReportsService.getAllReports({
        filters: {
          period: values.period.format('YYYY-MM-DD')
        },
        format: 'json'
      })
      console.log({report})



    } catch (error) {
      console.error({error})
      alert(error)  
    }
  };

  const handleCreateReport = async () => {
    try {
      let result = await userReportsService.createReport()
      console.log({result})
    } catch (error) {
      console.error({error})
      alert(error)  
    }
  }

  useEffect(() => {
    form.setFieldsValue({ period: dayjs().subtract(1, 'month') })
  }, [])

  return (
    <Card title={
      <Typography.Title level={3}>Reporte de Actividad de Usuario</Typography.Title>
    }>
      <div>
      <Button onClick={handleCreateReport}>
        <PlusOutlined/> Crear un Reporte
      </Button>
      </div>
      
      <br/>

      <Form
        form={form}
        name="download"
        onFinish={onFinish}
        layout="horizontal"
      >
        <Flex gap={10}>
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
        </Flex>
      </Form>

      
    </Card>
  );
};

export default ReportsUserActivity;
