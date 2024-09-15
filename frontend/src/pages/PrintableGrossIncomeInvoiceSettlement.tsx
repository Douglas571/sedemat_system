import React from 'react';
import { Typography, Flex, Descriptions, DescriptionsProps } from 'antd';

const { Title } = Typography;

import { formatBolivares } from '../util/currency';

const GrossIncomeInvoiceSettlement: React.FC = () => {

  type Settlement = {
    business: Business,

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
    description: "PAGO POR :  IMPUESTO  SOBRE ACTIVIDAD ECONOMICA CORRESPONDIENTE A LOS MESES DE ABRIL Y MAYO AÑO 2024.",
    amountBs: 1000
  }

  const {business} = settlement

  const headerItems: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'RAZÓN SOCIAL',
      children: <p>{business.businessName}</p>,
    },
    {
      key: '2',
      label: 'RIF',
      children: <p>{business.dni}</p>,
    },
    {
      key: '3',
      label: 'DESCRIPCIÓN DEL PAGO',
      children: <p>{settlement.description}</p>,
    },
    {
      key: '4',
      label: 'MONTO',
      children: <p>{formatBolivares(settlement.amountBs)}</p>,
    },
    {
      key: '5',
      label: 'Address',
      children: <p>No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China</p>,
    },
  ];
  return (
    <Flex vertical style={{ width: '100%' }}>

      <Flex align='center' justify='center' gap={10}>
          <img src={"/images/zamora_flag.png"} width={100} alt="Zamora Flag" />
          <img src={"/images/zamora_shield.png"} width={100} alt="Zamora Shield" />
          <Flex style={{maxWidth: "350px", textAlign: 'center', fontFamily: "Arial"}}>
              REPÚBLICA BOLIVARIANA DE VENEZUELA<br/>
              ALCALDIA DEL MUNICIPIO ZAMORA ESTADO FALCÓN
          </Flex>
          <img src={"/images/sedemat_logo.png"} width={100} alt="SEDEMAT Shield" />
      </Flex>

      <Flex justify='right'>COMPROBANTE DE INGRESO N°9095</Flex>
      <Flex justify='right'>PUERTO CUMAREBO; 05 DE AGOSTO 2024</Flex>

      <Descriptions 
        size='small'
        bordered
        items={headerItems}

      />

       
      TRANSFERENCIA
      MONTO 

      PAGO POR 

      MONTO EN LETRAS 

      CÓDIGO 
      DESCRIPCIÓN 
      MONTO 

      TOTAL COMPROBANTE DE INGRESOS

      DATOS DEL PAGO 
      BANCO VENEZUELA 
      CUENTA 0102-0339...1892
      BENEFICIARIO: SEDEMAT 

      FECHA: DD/MM/YYYY 
      REFERENCIA: 111111-111111
      VERIFICADO POR: TRABAJADOR 
      FIRMA Y SELLO 
    </Flex>
  );
};

export default GrossIncomeInvoiceSettlement;