import React from 'react';
import { Typography, Flex, Descriptions, DescriptionsProps, Table, TableProps } from 'antd';

const { Title } = Typography;

import { formatBolivares } from '../util/currency';
import { IGrossIncomeInvoice, Business } from '../types';

const GrossIncomeInvoiceSettlement: React.FC = () => {

  type Settlement = {
    business: Business,

    grossIncomeInvoice: IGrossIncomeInvoice

    description: string
    amountBs: number
  }

  const settlement: Settlement = {
    business: {
      businessName: "Supermercado Amir",
      dni: "V-12184106-8",
      economicActivity: {
        code: "123456",
        title: "Comercio"
      }
    },
    grossIncomeInvoice: {
      id: 1,
      date: new Date(),
      amountBs: 1000,
      businessId: 1,
      totalBs: 1000,
    },
    description: "PAGO POR :  IMPUESTO  SOBRE ACTIVIDAD ECONOMICA CORRESPONDIENTE A LOS MESES DE ABRIL Y MAYO AÑO 2024.",
  }

  const {business} = settlement

  const headerItems: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'RAZÓN SOCIAL',
      children: business.businessName,
      span: 3,
    },
    {
      key: '2',
      label: 'RIF',
      children: business.dni,
      span: 3,
    },
    {
      key: '3',
      label: 'DESCRIPCIÓN DEL PAGO',
      children: settlement.description,
      span: 6,
    },
    {
      key: '4',
      label: 'MONTO',
      children: formatBolivares(settlement.grossIncomeInvoice.amountBs),
      span: 2,
    },{
      key: '5',
      labelStyle: {
        display: "none",
      },
      children: 'LETRAS',
      span: 4,
    },
  ];


  const tableColumns: TableProps['columns'] = [
    {
      title: 'CÓDIGO',
      dataIndex: 'code',
      key: 'code',
      align: 'left',
    },
    {
      title: 'DESCRIPCIÓN',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
    },
    {
      title: 'MONTO',
      dataIndex: 'amountBs',
      key: 'amountBs',
      align: 'right',
      render: (value) => formatBolivares(value)
    }
  ];

  const tableItems: TableProps['dataSource'] = [
    {
      code: '301021200',
      description: 'DEUDAS MOROSAS',
      amountBs: 1178.1,
    },
    {
      code: '301090101',
      description: 'INGRESO POR FORMULARIOS Y GACETAS MUNICIPALES',
      amountBs: 83.90, // Assuming amount is not specified
    },
    {
      code: '301035400',
      description: 'ASEO DOMICILIARIO',
      amountBs: 784, // Assuming amount is not specified
    },
  ];

  const descriptionPaymentDetails: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'BANCO',
    children: "BANCO VENEZUELA C.A",
  },
  {
    key: '2',
    label: 'CUENTA',
    children: "0102-0339...1892",
  },
  {
    key: '3',
    label: 'BENEFICIARIO',
    children: "SEDEMAT",
  },
  {
    key: '4',
    label: 'FECHA',
    children: "DD/MM/YYYY",
  },
  {
    key: '5',
    label: 'REFERENCIA',
    children: "111111-111111",
  },
  {
    key: '6',
    label: 'VERIFICADO POR',
    children: "TRABAJADOR",
  },    
];

  return (
    <Flex vertical style={{ width: '100%' }}>

      <Flex align='center' justify='center' gap={10}>
          <img src={"/images/zamora_flag.png"} width={100} alt="Zamora Flag" />
          <img src={"/images/zamora_shield.png"} width={100} alt="Zamora Shield" />
          <Flex style={{maxWidth: "350px", textAlign: 'center', fontFamily: "Arial"}}>
              <Typography.Text>
              REPÚBLICA BOLIVARIANA DE VENEZUELA<br/>
              ALCALDIA DEL MUNICIPIO ZAMORA ESTADO FALCÓN
              </Typography.Text>
          </Flex>
          <img src={"/images/sedemat_logo.png"} width={100} alt="SEDEMAT Shield" />
      </Flex>

      <Flex justify='right'><Typography.Text>COMPROBANTE DE INGRESO N°9095</Typography.Text></Flex>
      <Flex justify='right'><Typography.Text>PUERTO CUMAREBO; 05 DE AGOSTO 2024</Typography.Text></Flex>

      <Descriptions 
        column={6}
        size='small'
        bordered
        items={headerItems}
        style={{marginBottom: "20px"}}
      />

      <Table
        size='small'
        columns={tableColumns}
        dataSource={tableItems}
        bordered
        pagination={false}
        style={{marginBottom: "20px"}}
        summary={(pageData) => {

          console.log(pageData)

          return (
          <Table.Summary.Row style={{ borderTop: "1px solid rgba(5, 5, 5, 0.06)"}}>
            <Table.Summary.Cell index={0} colSpan={2} align='right'>TOTAL COMPROBANTE DE INGRESO:</Table.Summary.Cell>
            <Table.Summary.Cell index={0} colSpan={2} align='right'>{formatBolivares(settlement.grossIncomeInvoice.amountBs)}</Table.Summary.Cell>
          </Table.Summary.Row>)

        }}
      />

      <Flex>
        <Descriptions
          column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          bordered
          size='small'
          items={descriptionPaymentDetails}

          style={{
            
            flexGrow: 1,
          }}
        />

        <Flex vertical 
            style={{
              // border: "1px solid rgba(5, 5, 5, 0.06)",
              // borderRadius: "10px 10px 0px 0px",
              minWidth: "50%",

              border: "1px solid rgba(5, 5, 5, 0.06)",
        }}>
          <div style={{
              padding: `${8}px ${14}px`,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              borderBottom: "1px solid rgba(5, 5, 5, 0.06)",
            }}
          >
            <Typography.Text>FIRMA Y SELLO</Typography.Text>
          </div>
          <div style={{
            height: "100%",
          }}>
            
          </div>

        </Flex> 
        
        
      </Flex>
    </Flex>
  );
};

export default GrossIncomeInvoiceSettlement;