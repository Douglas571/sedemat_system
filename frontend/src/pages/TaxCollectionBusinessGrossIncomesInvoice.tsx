import React from 'react';
import { Card, Typography, Table } from 'antd';
const { Title, Text } = Typography;

import dayjs from 'dayjs';

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
	};

    const MMVExchangeRate = Math.max(
        invoiceDetails.currencyExchangeRates.dolarBCV, 
        invoiceDetails.currencyExchangeRates.euroBCV
    );

    

    return (
        <Card title="Gross Income Invoice Details">
            <Title level={4}>Invoice #{invoiceDetails.id}</Title>
            <Text>Date: {dayjs().format('YYYY-MM-DD')}</Text>
            <Text strong style={{ display: 'block', marginTop: 16 }}>Customer: N/A</Text>

            <Table 
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
    



