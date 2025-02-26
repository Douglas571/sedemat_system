import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Flex, Button, Card, Typography, Form, DatePicker } from 'antd';
import { FilterOutlined, FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import useAuthentication from 'hooks/useAuthentication';

import { IVehicle } from '../../util/types';
import * as vehiclesService from '../../services/vehiclesService';

const datePresetRanges: TimeRangePickerProps['presets'] = [
  { label: 'Hoy', value: [dayjs(), dayjs()] },
  { label: 'Esta Semana', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'Este Mes', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: 'Este Año', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [form] = Form.useForm();
  const { userAuth } = useAuthentication();
  const navigate = useNavigate();

  const fetchVehicles = async (filters?: any) => {
    const rawFilters = filters || form.getFieldsValue();
    const filter = {
      createdAtStart: rawFilters?.createdAt?.[0]?.format('YYYY-MM-DD'),
      createdAtEnd: rawFilters?.createdAt?.[1]?.format('YYYY-MM-DD'),
    };

    const vehiclesData = await vehiclesService.getAllVehicles({ filter });
    setVehicles([...vehiclesData.sort((a, b) => a.id > b.id ? 1 : -1)]);
  };

  useEffect(() => {
    fetchVehicles();

    form.setFieldsValue({
      createdAt: [dayjs().startOf('month'), dayjs()],
    });
  }, []);

  const columns: ColumnProps<IVehicle>[] = [
    {
      title: 'Placa',
      dataIndex: 'plate',
      key: 'plate',
      render: (text) => text,
      sorter: (a, b) => a.plate.localeCompare(b.plate),
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      render: (text) => text,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
      render: (text) => text,
      sorter: (a, b) => a.model.localeCompare(b.model),
    },
    {
      title: 'Año',
      dataIndex: 'year',
      key: 'year',
      render: (text) => dayjs(text).format('YYYY'),
      sorter: (a, b) => dayjs(a.year).isBefore(dayjs(b.year)) ? -1 : 1,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (text) => text,
      sorter: (a, b) => a.color.localeCompare(b.color),
    },
    {
      title: 'Tipo de Vehículo',
      dataIndex: ['vehicleType', 'type'],
      key: 'vehicleType',
      render: (text) => text,
      sorter: (a, b) => a.vehicleType.type.localeCompare(b.vehicleType.type),
    },
    {
      title: 'Acciones',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Flex gap={16}>
          <Link to={`/vehicles/${record.id}`}>Ver Detalles</Link>
        </Flex>
      ),
    },
  ];

  const handleDownloadExcelFiles = async () => {
    
  };

  const handleNewVehicle = async () => {

    navigate('/vehicles/new');

  }

  return (
    <Card title={<Flex align='center' gap={20}>
      <Typography.Title level={1}>Vehículos</Typography.Title>
      <Button onClick={handleNewVehicle}><PlusOutlined/>Agregar</Button>
    </Flex>}>
      <Form form={form} layout="inline" onFinish={fetchVehicles}>
        <Flex justify="space-between" style={{ width: '100%' }}>
          <Flex>
            <Form.Item label="Fecha de Creación" name="createdAt">
              <DatePicker.RangePicker presets={datePresetRanges} />
            </Form.Item>
            <Form.Item>
              <Button icon={<FilterOutlined />} htmlType="submit">
                Filtrar
              </Button>
            </Form.Item>
          </Flex>
          <Button
            icon={<FileExcelOutlined />}
            style={{ marginLeft: 8 }}
            onClick={handleDownloadExcelFiles}
          >
            Descargar
          </Button>
        </Flex>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={vehicles}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default VehiclesPage;