import React from 'react';
import { Card, Typography, Table, Descriptions, List } from 'antd';
const { Title, Text } = Typography;

const GrossIncomeInvoiceDetails: React.FC = () => {
	// Dummy data
	const invoiceDetails = {
		id: 1,
        currencyExchangeRates: {
            id: 1,
            dolarBCV: 38,
            euroBCV: 43,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
		grossIncomes: [
            {
                amountBs: 1022,
                period: new Date('1/8/2024'),
                business: {
                    economicActivity: {
                        name: 'Restaurante',
                        minTax: 10,
                        alicuota: 0.01
                    },
                },
                branchOffice: {
                    nickname: 'Sucursal 1'
                }
            },
            {
                amountBs: 333,
                period: new Date('1/7/2024'),
                business: {
                    economicActivity: {
                        name: 'Restaurante',
                        minTax: 10,
                        alicuota: 0.01
                    },
                },
                branchOffice: {
                    nickname: 'Sucursal 1'
                }
            },
            {
                amountBs: 900,
                period: new Date('1/6/2024'),
                business: {
                    economicActivity: {
                        name: 'Restaurante',
                        minTax: 10,
                        alicuota: 0.01
                    },
                },
                branchOffice: {
                    nickname: 'Sucursal 1'
                }
            }
		],

        createdByUser: {
            person: {
                firstName: 'Jose',
                lastName: 'Herrera',
            },
        },

        checkedByUser: {
            person: {
                firstName: 'Hipólita',
                lastName: 'Gonzales',
            },
        },
	};

    const MMVExchangeRate = Math.max(
        invoiceDetails.currencyExchangeRates.dolarBCV, 
        invoiceDetails.currencyExchangeRates.euroBCV
    );

    

    return (
        <Card title="Gross Income Invoice Details">
            <Title level={4}>Invoice #{invoiceDetails.id}</Title>
            <Text>Date: {dayjs().format('YYYY-MM-DD')}</Text>

            <Title level={5} style={{ textAlign: 'center' }}>Descripción del Contribuyente</Title>
            <Descriptions bordered layout='vertical' size='small'>
                <Descriptions.Item label="Contribuyente" style={{ width: '20%' }} >Carnicería el poder de adonai, C.A</Descriptions.Item>
                <Descriptions.Item label="Rif" style={{ width: '12%' }}>J-40234567-8</Descriptions.Item>
                <Descriptions.Item label="N°" style={{ width: '12%' }}>3.2.03.01</Descriptions.Item>

                <Descriptions.Item label="Ramo" style={{ width: '20%' }}>Restaurante</Descriptions.Item>
                <Descriptions.Item label="Mts2" style={{ width: '5%' }}>50</Descriptions.Item>
                <Descriptions.Item label="Tipo"  style={{ width: '5%' }}>I</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ textAlign: 'center' }}>Estado de Cuenta</Title>

            <Table 
                size='small'
                dataSource={invoiceDetails.grossIncomes} 
                pagination={false}
            >
                <Table.Column 
                    title="Periodo" 
                    dataIndex="period" 
                    key="period" 
                    render={(period: Date) => dayjs(period).format('MMM-YY')}
                />
                <Table.Column 
                    title="Ingreso" 
                    dataIndex="amountBs" 
                    key="amountBs" 
                    render={(amountBs: number) => `${amountBs} Bs.`}
                />
                <Table.Column 
                    title="Alicuota" 
                    dataIndex={['business', 'economicActivity', 'alicuota']} 
                    key="alicuota" 
                    render={(alicuota: number) => `${alicuota * 100}%`}
                    width="8%"
                    align="center"
                />
                <Table.Column 
                    title="Impuesto" 
                    dataIndex="amountBs" 
                    key="tax" 
                    render={(amountBs: number, record: any) => {
                        const tax = amountBs * record.business.economicActivity.alicuota;
                        return `${tax.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Min. Trib." 
                    dataIndex={['business', 'economicActivity', 'minTax']} 
                    key="minTax" 
                    render={(minTax: number) => {
                        const minTaxThreshold = minTax * MMVExchangeRate;
                        return `${minTaxThreshold.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Aseo" 
                    dataIndex={['branchOffice', 'nickname']} 
                    key="aseo" 
                    width="15%"
                />
                <Table.Column 
                    title="Subtotal" 
                    key="subtotal" 
                    render={(text: any, record: any) => {
                        const tax = calculateTax(record, MMVExchangeRate);
                        return `${tax.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                    align="right"
                />
            </Table>

            <Table 
                size='small'
                dataSource={[{ formularyPrice: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Formulary Price" 
                    key="formularyPrice" 
                    render={() => (
                        <>
                            <Text>Formulario</Text>
                            <Text style={{ float: 'right' }}>1.00 Bs.</Text>
                        </>
                    )}
                />
            </Table>
            
            <Table 
                size='small'
                dataSource={[{ total: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Total" 
                    key="total" 
                    render={(text: any) => <Text strong>Total en Bs</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Total en Bs" 
                    key="total" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{text.total} Bs.</Text>}
                />
            </Table>

            <Table 
                size='small'
                dataSource={[{ total: 40 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Total" 
                    key="total" 
                    render={(text: any) => <Text strong>Total en MMV</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Total en Bs" 
                    key="total" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{Number(text.total / MMVExchangeRate).toFixed(2)} MMV</Text>}
                />
            </Table>
            <Typography.Paragraph style={{ textAlign: 'center', paddingTop: '10px', paddingBottom: '10px' }} strong>Tasa de cambio de la Moneda de Mayor Valor dle Banco Central de Venezuela (TCMMV)={MMVExchangeRate}Bs. desde el día 19/08/224 hasta el 23/08/2024.</Typography.Paragraph>

            
            <Descriptions bordered layout='vertical' size='small'>
                <Descriptions.Item label="Creado por" style={{ width: '20%' }} >{invoiceDetails.createdByUser.person.firstName} {invoiceDetails.createdByUser.person.lastName}</Descriptions.Item>
                <Descriptions.Item label="Revisado por" style={{ width: '20%' }} >{invoiceDetails.checkedByUser.person.firstName} {invoiceDetails.checkedByUser.person.lastName}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ textAlign: 'center' }}>Datos para Depósitos y/o Transferencias a Nombre de SEDEMAT</Title>
            <Descriptions bordered layout='vertical' size='small'>
                <Descriptions.Item label="Rif" span={1}>G-20012768-6</Descriptions.Item>
                <Descriptions.Item label="Correo" span={3}>SEDEMATZAMORAFALCON.8@GMAIL.COM</Descriptions.Item>

                <Descriptions.Item label="Banco de Venezuela" span={2}>Corriente 0102-0339-2500-0107-1892</Descriptions.Item>
                <Descriptions.Item label="Banco Bicentenario" span={2}>Corriente 0175-0162-3100-7494-9290</Descriptions.Item>
            </Descriptions>


            
        </Card>
    );
};

export default GrossIncomeInvoiceDetails;


function calculateTax(grossIncome: any, MMVExchangeRate: number) {

    // Calculate the tax based on the gross income amount and alicuota
    const calculatedTax = grossIncome.amountBs * grossIncome.business.economicActivity.alicuota;

    // Get the minimum tax value
    const minTax = grossIncome.business.economicActivity.minTax;

    // Calculate the minimum tax threshold
    const minTaxThreshold = minTax * MMVExchangeRate;

    // Return the higher of the calculated tax and the minimum tax threshold
    return Math.max(calculatedTax, minTaxThreshold);
}
    

// a function to given the whole invoice details, calculate the total in bolivarse and mmv
function calculateTotal(invoiceDetails: any) {
    // calculate the total in bolivarse
    const totalBs = invoiceDetails.grossIncomes.reduce((acc: any, curr: any) => acc + curr.amountBs, 0);

    // calculate the total in mmv
    const totalMMV = totalBs / MMVExchangeRate;

    return { totalBs, totalMMV };
    
}

