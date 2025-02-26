import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Select, Input, Button, Checkbox, Card, Typography, Row, Col, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import * as vehiclesService from '../../services/vehiclesService';
import ownersService from '../../util/people'; // Define this service to fetch owners
import * as businessService from '../../util/businessesApi'
import { IVehicleType, Person, Business, IVehicle } from '../../util/types';

import _ from 'lodash'

const { Option } = Select;
const { Title } = Typography;

interface FormVehicleType {
  plate: string,
  brand: string,
  model: string,
  year: string,
  color: string,
  usage: string,

  ownerType: 'individual' | 'business',

  isOwnerRegistered: boolean,
  owner: string,
  dni: string,

  firstName: string,
  lastName: string,

  vehicleType: string,
  isPublicTransport: boolean,
}

const VehicleForm: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const isEditing = !!id;

  const [form] = Form.useForm();
  const [vehicleTypes, setVehicleTypes] = useState<IVehicleType[]>([]);
  const [owners, setOwners] = useState<Person[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [vehicle, setVehicle] = useState<IVehicle>();
  
  const [ownerType, setOwnerType] = useState<'individual' | 'business'>('individual');

  const isOwnerRegistered = Form.useWatch('isOwnerRegistered', form)

  // Fetch vehicle types
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      const data = await vehiclesService.getAllVehicleTypes();
      setVehicleTypes(data);
    };
    fetchVehicleTypes();
  }, []);

  // Fetch owners and businesses
  useEffect(() => {
    const fetchOwnersAndBusinesses = async () => {
      const ownersData = await ownersService.fetchAll();
      const businessesData = await businessService.getAll();
      setOwners(ownersData);
      setBusinesses(businessesData);

      // console.log(ownersData, businessesData)
    };
    fetchOwnersAndBusinesses();
  }, []);

  // Handle owner type change
  const handleOwnerTypeChange = (value: 'individual' | 'business') => {
    setOwnerType(value);
  };

  // Handle owner registration checkbox change
  const handleIsOwnerRegisteredChange = (e: any) => {
    
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      // Extract owner ID
      let ownerId: number | null = null;
      let businessOwnerId: number | null = null;

      if (isOwnerRegistered) {
        const selectedOwner = values.owner;
        if (ownerType === 'individual') {
          ownerId = owners.find((owner) => owner.dni === selectedOwner.split(' - ')[0])?.id || null;
        } else {
          businessOwnerId = businesses.find((business) => business.dni === selectedOwner.split(' - ')[0])?.id || null;
        }
      }

      // Extract vehicle type ID
      const vehicleTypeId = vehicleTypes[values.vehicleType.split(' - ')[0] - 1]?.id;

      // Prepare vehicle data
      const vehicleData: Omit<IVehicle, 'id' | 'createdAt' | 'updatedAt'> = {
        plate: values.plate,
        brand: values.brand,
        model: values.model,
        year: values.year,
        color: values.color,
        usage: values.usage,
        isPublicTransport: values.isPublicTransport,
        vehicleTypeId,
        ownerId,
        businessOwnerId,
      };

      console.log(vehicleData)
      // Submit vehicle data
      await vehiclesService.createVehicle(vehicleData);
      console.log('Vehicle created successfully:', vehicleData);
    } catch (error) {
      console.error('Error creating vehicle:', error);
    }
  };

  return (
    <Card title={<Title level={2}>Registrar Vehículo</Title>}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item<FormVehicleType>
            label="Tipo de Propietario"
            name="ownerType"
            rules={[{ required: true, message: 'Seleccione el tipo de propietario' }]}
          >
            <Select onChange={handleOwnerTypeChange} defaultValue="individual">
              <Option value="individual">Persona Natural</Option>
              <Option value="business">Organización</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<FormVehicleType> name="isOwnerRegistered" valuePropName="checked">
            <Checkbox
              
              onChange={handleIsOwnerRegisteredChange}
              disabled={ownerType === 'business'} // Disable checkbox for businesses
            >
              Propietario ya registrado
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>

      {ownerType === 'business' || isOwnerRegistered ? (
        <Form.Item<FormVehicleType>
          label={ownerType === 'individual' ? 'Propietario Registrado' : 'Organización Registrada'}
          name="owner"
          rules={[{ required: true, message: 'Seleccione un propietario' }]}
        >
          <Select
            showSearch
            placeholder={`Buscar ${ownerType === 'individual' ? 'propietario' : 'organización'}`}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {ownerType === 'individual'
              ? owners.map((owner) => (
                  <Option key={owner.id} value={`${owner.dni} - ${owner.firstName} ${owner.lastName}`}>
                    {`${owner.dni} - ${owner.firstName} ${owner.lastName}`}
                  </Option>
                ))
              : businesses.map((business) => (
                  <Option key={business.id} value={`${business.dni} - ${business.businessName}`}>
                    {`${business.dni} - ${business.businessName}`}
                  </Option>
                ))}
          </Select>
        </Form.Item>
      ) : (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Nombre"
              name="firstName"
              rules={[{ required: true, message: 'Ingrese el nombre' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Apellido"
              name="lastName"
              rules={[{ required: true, message: 'Ingrese el apellido' }]}
            >
              <Input/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Cédula"
              name="dni"
              rules={[{ required: true, message: 'Ingrese la cédula' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      )}

        {/* Vehicle Information Section */}
        <Title level={4}>Información del Vehículo</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Placa"
              name="plate"
              rules={[{ required: true, message: 'Ingrese la placa' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Tipo de Vehículo"
              name="vehicleType"
              rules={[{ required: true, message: 'Seleccione el tipo de vehículo' }]}
            >
              <Select
                showSearch
                placeholder="Buscar tipo de vehículo"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {vehicleTypes.map((type, index) => (
                  <Option key={type.id} value={`${index + 1} - ${_.startCase(_.toLower(type.type))}`}>
                    {`${index + 1} - ${_.startCase(_.toLower(type.type))}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Marca"
              name="brand"
              rules={[{ required: true, message: 'Ingrese la marca' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Modelo"
              name="model"
              rules={[{ required: true, message: 'Ingrese el modelo' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Año"
              name="year"
              rules={[{ required: true, message: 'Ingrese el año' }]}
            >
              <Input/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Color"
              name="color"
              rules={[{ required: true, message: 'Ingrese el color' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Uso"
              name="usage"
            >
              <Input/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<FormVehicleType>
              label="Es transporte público"
              name="isPublicTransport"
            >
              <Switch defaultChecked checkedChildren="SÍ" unCheckedChildren="NO"/>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Registrar Vehículo
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default VehicleForm;