import React from 'react';
import { Card, Typography, List } from 'antd';

const { Title, Text } = Typography;

const GrossIncomeInvoiceDetails: React.FC = () => {
	// Dummy data
	const invoiceDetails = {
		invoiceNumber: 'INV-2023-001',
		date: '2023-05-15',
		customerName: 'Acme Corporation',
		items: [
			{ description: 'Product A', quantity: 2, unitPrice: 100, total: 200 },
			{ description: 'Product B', quantity: 1, unitPrice: 150, total: 150 },
			{ description: 'Service X', quantity: 1, unitPrice: 300, total: 300 },
		],
		subtotal: 650,
		tax: 52,
		total: 702,
	};

	return (
		<Card title="Gross Income Invoice Details" style={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
			<Title level={4}>Invoice #{invoiceDetails.invoiceNumber}</Title>
			<Text>Date: {invoiceDetails.date}</Text>
			<Text strong style={{ display: 'block', marginTop: 16 }}>Customer: {invoiceDetails.customerName}</Text>

			<List
				header={<div style={{ fontWeight: 'bold' }}>Items</div>}
				bordered
				dataSource={invoiceDetails.items}
				renderItem={(item) => (
					<List.Item>
						<Text>{item.description}</Text>
						<Text>Qty: {item.quantity}</Text>
						<Text>Price: ${item.unitPrice}</Text>
						<Text strong>Total: ${item.total}</Text>
					</List.Item>
				)}
				style={{ marginTop: 16, marginBottom: 16 }}
			/>

			<div style={{ textAlign: 'right' }}>
				<Text>Subtotal: ${invoiceDetails.subtotal}</Text>
				<br />
				<Text>Tax: ${invoiceDetails.tax}</Text>
				<br />
				<Title level={4}>Total: ${invoiceDetails.total}</Title>
			</div>
		</Card>
	);
};

export default GrossIncomeInvoiceDetails;

