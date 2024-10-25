import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Table, Button, Flex} from 'antd';

const { Title, Text } = Typography;

import useAuthentication from '../hooks/useAuthentication';

import * as reportsService from '../services/reportsService';
import dayjs from 'dayjs';
import { render } from '@testing-library/react';


interface reportRow {
  businessId: number
  businessName: string,
  businessDni: string
  branchOfficeNickname: string,
  classification: number, // from 1 to 3
  monthsWithoutDeclarationCount: number
  monthsPendingToBePaidCount: number
  monthsPendingToBeSettledCount: number
  lastMonthSettled: dayjs.Dayjs
}

const BasicComponent: React.FC = () => {

  const navigate = useNavigate();

  const { userAuth } = useAuthentication();
  const [businessGrossIncomesStatus, setBusinessGrossIncomesStatus] = useState<reportRow[]>([]);

  async function loadReport() {

    if (!userAuth.token) {
      return navigate('/login')
    }

    let businessReport = await reportsService.getBusinessesGrossIncomeStatusReport({
      token: userAuth.token
    })

    let reportRows: reportRow[] = [...businessReport]

    setBusinessGrossIncomesStatus([...reportRows])
  }

  useEffect(() => {
    loadReport()
  }, [])

  // <CheckCircleOutlined />

  const columns = [
    {
      title: 'Contribuyente',
      dataIndex: 'businessName',
      key: 'businessName',
      sorter: (a, b) => a.businessName.localeCompare(b.businessName),
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,

      render: (value: string, record: reportRow) => <Link to={`/tax-collection/${record.businessId}`}>{value}</Link>,
    },
    {
      title: 'DNI',
      dataIndex: 'businessDni',
      key: 'businessDni',
    },
    {
      title: 'Sucursal',
      dataIndex: 'branchOfficeNickname',
      key: 'branchOfficeNickName',
    },
    {
      title: 'Clasificación',
      dataIndex: 'classification',
      key: 'classification',

      filters: [
        { text: 'Al día', value: 1 }, 
        { text: 'Debe 3 meses o menos', value: 2 }, 
        { text: 'Debe 6 meses o menos', value: 3 }, 
        { text: 'Debe más de 6 meses', value: 4 }],
        
      onFilter: (value: any, record: reportRow) => record.classification === value,

      sorter: (a, b) => a.classification - b.classification,
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,

      render: (value: number, record: reportRow) => {
        let monthsPendingCount = record.monthsPendingToBePaidCount

        let shipStyles = {
          padding: '5px', borderRadius: '5px' , height: '30px', width: '50px'
        }

        if (value === 1 ) {
          return <Flex justify="center" align="center">
            <div style={{ background: '#0dff8e', ...shipStyles}}></div>
          </Flex>
        }
        
        if (value === 2 ) {
          return <Flex justify="center" align="center">
            <div style={{ background: '#fff94f', ...shipStyles}}></div>
          </Flex>
        }

        if (value === 3 ) {
          return <Flex justify="center" align="center">
            <div style={{ background: '#1994ff', ...shipStyles}}></div>
          </Flex>
        }

        return <Flex justify="center" align="center">
            <div style={{ background: '#ff0d76', ...shipStyles}}></div>
          </Flex>

        
      }
    },
    {
      title: 'Meses pendientes de pagar',
      dataIndex: 'monthsPendingToBePaidCount',
      key: 'monthsPendingToBePaidCount',
      
      sorter: (a, b) => a.monthsPendingToBePaidCount - b.monthsPendingToBePaidCount,
      showSorterTooltip: false,
      sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
      title: 'Meses sin declaración',
      dataIndex: 'monthsWithoutDeclarationCount',
      key: 'monthsWithoutDeclarationCount',
      sorter: (a, b) => a.monthsWithoutDeclarationCount - b.monthsWithoutDeclarationCount,
      showSorterTooltip: false,
      sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
      title: 'Meses pendientes de liquidar',
      dataIndex: 'monthsPendingToBeSettledCount',
      key: 'monthsPendingToBeSettledCount',
      sorter: (a, b) => a.monthsPendingToBeSettledCount - b.monthsPendingToBeSettledCount,
      showSorterTooltip: false,
      sortDirections: ['ascend', 'descend', 'ascend']
    },

    {
      title: 'Último mes liquidado',
      dataIndex: 'lastMonthSettled',
      key: 'lastMonthSettled',
      render: (value: string) => {
        
        return dayjs(value).format('DD/MM/YYYY')
      },
    }
  ]

    return (
        <Card 
          style={{  }}
          title={<Title level={1}>Reporte de Contribuyentes</Title>}
        >
            
            <Table 
              rowKey={ record => record.businessName + record.branchOfficeNickname + record.busienssDni }
              columns={columns} 
              dataSource={businessGrossIncomesStatus}/>
        </Card> 
    );
};

export default BasicComponent;
