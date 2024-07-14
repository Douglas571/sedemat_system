import React from 'react'
import type { DatePickerProps, FormProps } from 'antd'
import { Upload, Switch , message, Button, DatePicker, Form, Input, InputNumber, Select, AutoComplete } from 'antd'
import FormItemLabel from 'antd/es/form/FormItemLabel'

import type { GetProp, UploadFile, UploadProps } from 'antd';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT



const onChange: DatePickerProps['onChange'] = (date, dateString) => {
	console.log(date, dateString)
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
	console.log('Failed:', errorInfo)
}

function NewPaymentForm(): JSX.Element {

	const [messageApi, contextHolder] = message.useMessage()

	const throwError = () => {
		messageApi.open({
			type: 'error',
			content: 'This is an error message',
		});
	};

	
	

	async function sendPaymentData(paymentData: Payment): Promise<string> {
		
			const response = await fetch(HOST + '/v1/payments', {
				method: 'POST', // Specify the method
				headers: {
					'Content-Type': 'application/json' // Specify the content type as JSON
				},
				body: JSON.stringify(paymentData) // Convert the object to a JSON string
			})

			if (!response.ok) {
				console.log({error: response.body})
				throw new Error(`Hubo un error al registrar pago`)
			}

			const data = await response.json() // Parse the JSON response
			console.log('Success:', data)
			console.log({ data })
			return JSON.stringify(data)

			
	}

	interface FieldType {
		username?: string
		password?: string
		reference: string
		dni: string
		business_name: string
		amount: number,
		account: string,
		paymentDate: Date
	}

	type Payment = {
		id?: number
		reference: string
		business_name: string
		dni: string
		amount: number
		account: string
		paymentDate: Date
		image: string
		state?: string
	}
	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		
		try {

			// get the image 
			// send the image to the server
			// get the id of the image
			let boucherImageUrl = await handleUploadBoucher()
			
			// map all values to a ready to ship payment object
			let payment: Payment = {
				reference: values.reference,
				business_name: values.business_name,
				dni: values.dni,
				amount: values.amount,
				account: values.account,
				paymentDate: values.paymentDate,
				image: boucherImageUrl
			}

			// send the payment
			await sendPaymentData(payment)
		} catch(error) {
			// process errors

			// if reference is duplicated

			// if reference is malformed 

			// if business is not registered 
			
			// other unexpected errors 
			messageApi.open({
				type: 'error',
				content: error.message,
			});
		}
			
		
	}

	const options = [
		{
			value: '11.479.362',
			label: '11.479.362'
		},
		{
			value: '7.490.919',
			label: '7.490.919'
		},
		{
			value: '29.748.656',
			label: '29.748.656'
		}
	]

	const accounts = [
		{
			value: '1892',
			label: '1892'
		},
		{
			value: '3055',
			label: '3055'
		},
		{
			value: '9290',
			label: '9290'
		},
		{
			value: '5565',
			label: '5565'
		}
	]

	const methods = [
		{
			value: 'transfer',
			label: 'Transferencia'
		},
		{
			value: 'pago_mobil',
			label: 'PagoMovil'
		},
		{
			value: 'bio_pago',
			label: 'BioPago'
		}
	]



	type Option = {
		value: string,
		label: string
	}

	const [businessName, setBusinessName] = React.useState('');
	const [businessNameOptions, setBusinessNameOptions] = React.useState<Array<Option>>([])

	const onSelect = (data: string) => {
		console.log('onSelect', data);
	};
	
	const onChangeBusinessName = (data: string) => {
		setBusinessName(data);
	};
	
	interface Business {
		id: number;
		businessName: string;
		rif: string;
	}

	const businesses: Business[] = [
		{ id: 1, businessName: "Tech Solutions", rif: "J-12345678-9" },
		{ id: 2, businessName: "Green Landscaping", rif: "J-98765432-1" },
		{ id: 3, businessName: "Sunny Side Bakery", rif: "J-56473829-4" },
		{ id: 4, businessName: "Blue Ocean Travel", rif: "J-10987654-3" },
		{ id: 5, businessName: "Tech Innovators", rif: "J-34567890-1" },
		{ id: 6, businessName: "Red Mountain Coffee", rif: "J-11223344-5" }
	];

	function filterBusinessNames(businesses: Business[], searchText: string): Business[] {
		// Convert the search text to lowercase for case-insensitive search
		const lowerCaseSearchText = searchText.toLowerCase();
		
		// Filter the business objects
		return businesses.filter(business =>
			business.businessName.toLowerCase().includes(lowerCaseSearchText)
		);
	}


	const getOptions = (searchText: string): Option[] => {
		return filterBusinessNames(businesses, searchText).map(b => ({
			value: b.businessName,
			label: b.businessName
		}))
	}

	const [fileList, setFileList] = React.useState<UploadFile[]>([]);
	const [uploading, setUploading] = React.useState(false);

	const [boucherUrl, setBoucherUrl] = React.useState("")

	const uploadProps: UploadProps = {
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
			console.log("adding files")
			setFileList([...fileList, file]);
	  
			return false;
		},
		fileList,
	}

	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

	const handleUploadBoucher = async (): Promise<string> => {
		try {
			console.log("sending files")
			const formData = new FormData()
			fileList.forEach((file) => {
				formData.append('image', file as FileType);
			});

			const response = await fetch(`${HOST}/v1/payments/upload`, {
				method: 'POST',
				body: formData,
			})

			console.log("response")
			const data = await response.json()
			console.log({data})
			const imagePath = data.path 

			return imagePath

		} catch (error) {
			console.log({error})
		}

		return ""
	}

	return (
		<div>
			<div>
				{contextHolder}
				<Form
					initialValues={{}}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
				>
				

					<Form.Item<FieldType>
						rules={[{ 
							required: true, 
							message: 'introduce la razon social!' 
						}]}
						label='Razón Social'
						name='business_name'
					>
						<AutoComplete
							options={businessNameOptions}
							style={{ width: 200 }}
							onSelect={onSelect}
							onSearch={(text) => setBusinessNameOptions(getOptions(text))}
							placeholder="input here"
						/>
					</Form.Item>

					<Form.Item<FieldType>
						rules={[{ required: true, message: 'Please input your username!' }]}
						label='Rif o Cédula'
						name='dni'
					>
						<Select
							showSearch
							placeholder='Select a person'
							optionFilterProp='label'
							// onChange={onChange}
							// onSearch={onSearch}
							options={options}
						/>
					</Form.Item>

					<Form.Item<FieldType>
						label='Referencia' 
						name='reference'
					>
						<Input type='number' maxLength={6} />
					</Form.Item>

					<Form.Item<FieldType>
						label='Monto'
						name='amount'
					>
						<InputNumber
							addonAfter='$'
							type='number'
							defaultValue='0'
							min='0'
							step='0.01'
						/>
					</Form.Item>

					<Form.Item<FieldType>
						label='Fecha de Pago' 
						name="paymentDate">
						<DatePicker onChange={onChange} />
					</Form.Item>

					<Form.Item<FieldType> 
						label='Cuentas' 
						name='account'
					>
						<Select
							defaultValue={`${accounts[0].value}`}
							optionFilterProp='label'
							// onChange={onChange}
							// onSearch={onSearch}
							options={accounts}
						/>
					</Form.Item>

					<Form.Item label='Método' name='disabled' valuePropName='checked'>
						<Select
							defaultValue={methods[0].value}
							optionFilterProp='label'
							// onChange={onChange}
							// onSearch={onSearch}
							options={methods}
						/>
					</Form.Item>

					<Form.Item>
						<Button type='primary' htmlType='submit'>
							Guardar
						</Button>
					</Form.Item>

				</Form>
			</div>

			<div>
						<Upload 
							name='boucher'
							{...uploadProps}
						>
							<Button>Seleccionar Boucher</Button>
						</Upload>
						<Button onClick={() => handleUploadBoucher()}>Cargar Boucher</Button>
					</div>


			<Button onClick={throwError}>Error</Button>
		</div>
	)
}

export default NewPaymentForm
