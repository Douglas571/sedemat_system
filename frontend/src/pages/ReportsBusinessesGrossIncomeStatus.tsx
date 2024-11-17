import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Table, Button, Flex, Tag, Tooltip} from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

import useAuthentication from '../hooks/useAuthentication';

import * as reportsService from '../services/reportsService';
import dayjs from 'dayjs';


import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";

Chart.register(CategoryScale);

import { Doughnut, Pie } from 'react-chartjs-2';

interface reportRow {
  businessId: number
  businessName: string,
  businessDni: string
  branchOfficeNickname: string,
  classification: number, // from 1 to 4
  monthsWithoutDeclarationCount: number
  monthsPendingToBePaidCount: number
  monthsPendingToBeSettledCount: number
  lastMonthSettled: dayjs.Dayjs,
  lackingMonths: dayjs.Dayjs[]
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
      width: 400
    },
    {
      title: 'RIF',
      dataIndex: 'businessDni',
      key: 'businessDni',
      width: 130,

      sorter: (a, b) => a.businessDni.localeCompare(b.businessDni),
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: 'Sucursal',
      dataIndex: 'branchOfficeNickname',
      key: 'branchOfficeNickName',
      width: 130,
      sorter: (a, b) => a.branchOfficeNickname.localeCompare(b.branchOfficeNickname),
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: "Categoría",
      dataIndex: 'businessActivityCategoryName',
      key: 'businessActivityCategoryName',
      showSorterTooltip: false,
      sorter: (a, b) => a?.businessActivityCategoryName?.localeCompare(b?.businessActivityCategoryName),
      sortDirections: ['ascend', 'descend', 'ascend'],
      render: (category: string) => {
        if (!category) {
          return '--'
        }

        return category
      }

    },
    {
      title: 'Clasificación (Por Puntualidad)',
      dataIndex: 'classification',
      key: 'classification',

      filters: [
        { text: 'Al día', value: 1 }, 
        { text: 'Debe 3 meses o menos', value: 2 }, 
        { text: 'Debe 6 meses o menos', value: 3 }, 
        { text: 'Debe más de 6 meses', value: 4 }],
        
      onFilter: (value: any, record: reportRow) => record.classification === value,

      sorter: (a, b) => a.monthsPendingToBePaidCount - b.monthsPendingToBePaidCount,
      sortDirections: ['ascend', 'descend', 'ascend'],
      showSorterTooltip: false,

      render: (value: number) => {

        let shipStyles = {
          padding: '5px', borderRadius: '5px' , height: '30px', width: '50px',
          textAlign: 'center'
        }

        if (value === 1 ) {
          return <Flex justify="center" align="center">
            <Tag color='green' style={{...shipStyles}}>AL DÍA</Tag>
          </Flex>
        }
        
        if (value === 2 ) {
          return <Flex justify="center" align="center">
            <Tag color='orange' style={{ ...shipStyles}}>ALTA</Tag>
          </Flex>
        }

        if (value === 3 ) {
          return <Flex justify="center" align="center">
            <Tag color='blue' style={{ ...shipStyles}}>MEDIA</Tag>
          </Flex>
        }

        return <Flex justify="center" align="center">
            <Tag color='red' style={{ ...shipStyles}}>BAJA</Tag>
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
      sortDirections: ['ascend', 'descend', 'ascend'],


      render: (value, record) => {
        return <Tooltip title={record
          .lackingMonths
          .sort((a, b) => dayjs(a).isBefore(dayjs(b) ? 1 : -1))
          .map(month => dayjs(month).format('MMMM-YY').toUpperCase()).join(', ')}>
          <Flex justify="center" align="center">
            {value}
          </Flex>
        </Tooltip>
      }
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

        if (!value) return '--'
        
        return dayjs(value).format('MMMM-YY').toUpperCase()
      },
    }
  ]


  const [chartData, setChartData] = useState({
    // ! This information is overwritten by the setChartData bellow
    
    datasets: [
      // ! this will be overwritten too, but leaved this here for setting the types
      {
        data: [
          businessGrossIncomesStatus.filter(b => b.classification === 1).length,
          businessGrossIncomesStatus.filter(b => b.classification === 2).length,
          businessGrossIncomesStatus.filter(b => b.classification === 3).length,
          businessGrossIncomesStatus.filter(b => b.classification === 4).length,
        ],
        backgroundColor: [
          "green",
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        
      }
    ]
  });

  useEffect(() => {
    setChartData({
      ...chartData,
      labels: [
        "Al día" + ": " + businessGrossIncomesStatus.filter(b => b.classification === 1).length,
        "Alta" + ": " + businessGrossIncomesStatus.filter(b => b.classification === 2).length, 
        "Media" + ": " + businessGrossIncomesStatus.filter(b => b.classification === 3).length, 
        "Baja" + ": " + businessGrossIncomesStatus.filter(b => b.classification === 4).length
      ], 
      datasets: [
        {
          data: [
            businessGrossIncomesStatus.filter(b => b.classification === 1).length,
            businessGrossIncomesStatus.filter(b => b.classification === 2).length,
            businessGrossIncomesStatus.filter(b => b.classification === 3).length,
            businessGrossIncomesStatus.filter(b => b.classification === 4).length,
          ],
          backgroundColor: [
            "rgb(38, 224, 88)",
            'rgb(255, 205, 86)',
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
          ],
          borderColor: "black",
          borderWidth: 1
        },
      ],
    })
  }, [businessGrossIncomesStatus])

    return (
        <Card 
          style={{  }}
          title={<Flex align='center' justify='space-between'>
            <Title level={1}>Reporte Sobre Declaraciones De Ingresos</Title>
            <Button icon={<FileExcelOutlined />} onClick={() => reportsService.downloadBusinessesGrossIncomeStatusReport({ token: userAuth.token, format: 'excel' })}>
              Descargar Excel
            </Button>
          </Flex>}
        >

          <Flex vertical gap={34}>
            <Flex>    
              <div>
                <Doughnut
                  data={chartData}
                  options={{
                    offset: 10,
                    spacing: 5,
                    hoverOffset: 40,
                    layout: {
                      padding: {
                        left: 34,
                        right: 34,
                        top: 0,
                        bottom: 0
                      }
                    },
                    plugins: {
                      title: {
                        display: true,
                        position: "top",
                        text: "Núm. de Contribuyentes Por Puntualidad",
                      },
                      legend: {
                        position: "bottom",
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            let total = businessGrossIncomesStatus.length
                            let sample = context.parsed

                            let percent = ((sample / total) * 100).toFixed(2)
                            
                            return `${percent}%`}
                        }
                      }
                      
                    },
                    aspectRatio: 1,

                    maintainAspectRatio: false 
                    
                  }}

                  height={"400px"}
                  width={"400px"}
                  // margin={50}

                />
              </div>
            </Flex>
            
            <Table 
              rowKey={ record => record.businessName + record.branchOfficeNickname + record.busienssDni }
              columns={columns} 
              dataSource={businessGrossIncomesStatus}
              
              style={{
                overflow: 'scroll'
              }}
            />
          </Flex>
        </Card> 
    );
};

export default BasicComponent;
