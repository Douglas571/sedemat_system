import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Descriptions, Button, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as vehiclesService from '../../services/vehiclesService';
import { IVehicle, IVehicleType } from '../../util/types';

import dayjs from 'dayjs'

const { Title } = Typography;

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extract vehicle ID from URL params
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<IVehicle | null>(null);
  const [vehicleType, setVehicleType] = useState<IVehicleType | null>(null);

  // Fetch vehicle and vehicle type data
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const vehicleData = await vehiclesService.getOneVehicle(Number(id));
        setVehicle(vehicleData);

        const vehicleTypeData = vehicleData.vehicleType
        setVehicleType(vehicleTypeData)
      } catch (error) {
        message.error('Error fetching vehicle data');
        console.error(error);
      }
    };

    fetchVehicleData();
  }, [id]);

  // Handle delete vehicle
  const handleDelete = async () => {
    try {
      await vehiclesService.deleteVehicle(Number(id));
      message.success('Vehicle deleted successfully');
      navigate('/vehicles'); // Redirect to vehicles list page
    } catch (error) {
      message.error('Error deleting vehicle');
      console.error(error);
    }
  };

  if (!vehicle || !vehicleType) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      title={<Title level={2}>Detalles del Vehículo</Title>}
      extra={
        <div>
          <Link to={`/vehicles/${id}/edit`}>
            <Button icon={<EditOutlined />} style={{ marginRight: 8 }}>
              Editar
            </Button>
          </Link>
          <Popconfirm
            title="¿Está seguro de eliminar este vehículo?"
            onConfirm={handleDelete}
            okText="Sí"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </div>
      }
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Placa">{vehicle.plate}</Descriptions.Item>
        <Descriptions.Item label="Marca">{vehicle.brand}</Descriptions.Item>
        <Descriptions.Item label="Modelo">{vehicle.model}</Descriptions.Item>
        <Descriptions.Item label="Año">{new Date(vehicle.year).getFullYear()}</Descriptions.Item>
        <Descriptions.Item label="Color">{vehicle.color}</Descriptions.Item>
        <Descriptions.Item label="Uso">{vehicle.usage}</Descriptions.Item>
        <Descriptions.Item label="Tipo de Vehículo">{vehicleType.type}</Descriptions.Item>
        <Descriptions.Item label="Transporte Público">
          {vehicle.isPublicTransport ? 'Sí' : 'No'}
        </Descriptions.Item>
        <Descriptions.Item label="Propietario">
          {vehicle.ownerId 
            ? <Link to={`/contacts/${vehicle.ownerId}`}>{vehicle.owner.firstName} {vehicle.owner.lastName}</Link>

            : `Organización ID: ${vehicle.businessOwnerId}`}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de Creación">
          {dayjs(vehicle.createdAt).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Última Actualización">
          {dayjs(vehicle.updatedAt).format('DD/MM/YYYY')}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default VehicleDetailPage;