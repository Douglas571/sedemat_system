import React, {useEffect} from 'react'
import type { DatePickerProps, FormProps } from 'antd'
import { Upload, Switch , message, Button, DatePicker, Form, Input, InputNumber, Select, AutoComplete } from 'antd'
import FormItemLabel from 'antd/es/form/FormItemLabel'

import type { GetProp, UploadFile, UploadProps } from 'antd';

import * as api from '../util/api'

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
	const [form] = Form.useForm();
	const [businessOptions, setBusinessOptions] = React.useState<Array<{label: string, value: number}>>()
	const [businesses, setBusinesses] = React.useState<Business[]>([])

	// i will get all business
	// i will map business to { lable: business.businessName, value: business.id}

	async function loadBusiness() {
		let fetchedBusiness = await api.fetchBusiness()

		setBusinesses(fetchedBusiness)
		setBusinessOptions(fetchedBusiness.map((b) => ({ label: b.businessName, value: b.businessName})))
	}
	
	useEffect(() => {
		loadBusiness()
	}, [])

	useEffect(() => {
		console.log({businessOptions})
	}, [businessOptions])

	
	function cleanDataFromForm(){
		// get the form
		// set values to empty 
	
		
		form.setFieldValue('business_name', '')
		form.setFieldValue('dni', '')
		form.setFieldValue('reference', '')
		form.setFieldValue('amount', 0)
		form.setFieldValue('account', accounts[0].value )

		// TODO: when i call this method, i will set a variable to modify a date variable
		// paymentDate: Date
	}

	async function sendPaymentData(paymentData: Payment): Promise<string> {
			const response = await fetch(HOST + '/v1/payments', {
				method: 'POST', // Specify the method
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(paymentData)
			})

			if (!response.ok) {
				const data = await response.json()
				console.log({data})
				throw new Error(data.error.msg)
			}

			// the payment was saved successfully was successful 
			const data = await response.json()
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
		isVerified?: boolean

	}
	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		
		try {

			// get the image 
			// send the image to the server
			// get the id of the image
			let boucherImageUrl = await handleUploadBoucher()
			console.log("continua despues de la imagen")

			if (!boucherImageUrl) {
				return ""
			}
			
			// map all values to a ready to ship payment object
			let payment: Payment = {
				reference: values.reference,
				business_name: values.business_name,
				dni: values.dni,
				amount: values.amount,
				account: values.account,
				paymentDate: values.paymentDate,
				image: boucherImageUrl,
				state: 'received',
			}
			console.log({sending: payment})

			// send the payment
			await sendPaymentData(payment)

			
			messageApi.open({
				type: 'success',
				content: "Pago guardado exitosamente",
			});

			cleanDataFromForm()

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
	const [businessRif, setBusinessRif] = React.useState('hola');
	const [businessNameOptions, setBusinessNameOptions] = React.useState<Array<Option>>([])

	const [fileList, setFileList] = React.useState<UploadFile[]>([]);
	const [uploading, setUploading] = React.useState(false);

	const [boucherUrl, setBoucherUrl] = React.useState("")

	interface Business {
		id: number;
		businessName: string;
		rif: string;
	}

	const onSelect = (data: string) => {
		console.log('onSelect', data);

		// get the rif
		let dni = businesses.find(b => b.businessName == data)?.dni
		console.log({dni})

		if (dni) {
			// set the rif
			console.log("setting rif")
			form.setFieldValue('dni', dni)
			setBusinessRif(dni)
			// set the name btw
			setBusinessName(data)
		}
	};
	
	const onChangeBusinessName = (data: string) => {
		setBusinessName(data);
	};
	

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

	const handleUploadBoucher = async (): Promise<string | undefined> => {
		try {
			console.log("sending files")

			if (fileList.length == 0) {
				throw Error("Selecciona un boucher")
			}
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
			console.log("hubo un error con la imagen")

			messageApi.open({
				type: 'error',
				content: error.message,
			});
		}
	}

	return (
		<div>
			<div>
				{contextHolder}
			<h1>Nuevo Pago</h1>
				<Form form={form}
					initialValues={{}}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
				>
				

					<Form.Item<FieldType>
						rules={[{ 
							required: true, 
							message: 'Introduzca la razón social' 
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
						label='Rif o Cédula'
						name='dni'
					>
						<Input disabled/>
						{/* <Select
							showSearch
							placeholder='Select a person'
							optionFilterProp='label'
							// onChange={onChange}
							// onSearch={onSearch}
							options={options}
						/> */}
					</Form.Item>

					<Form.Item<FieldType>
						rules={[{ required: true, message: 'Introduzca una referencia' }]}
						label='Referencia' 
						name='reference'

					>
						<Input type='number' maxLength={6} />
					</Form.Item>

					<Form.Item<FieldType>
						rules={[{ required: true, message: 'Introduzca el monto' }]}
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
						rules={[{ required: true, message: 'Seleccione una referencia' }]}
						label='Fecha de Pago' 
						name="paymentDate">
						<DatePicker onChange={onChange} />
					</Form.Item>

					<Form.Item<FieldType> 
						label='Cuentas' 
						name='account'
						initialValue={accounts[0].value}
					>
						<Select
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

					<div>
						<Upload 
							name='boucher'
							{...uploadProps}
						>
							<Button>Seleccionar Boucher</Button>
						</Upload>
						<br/>
					</div>

					<Form.Item>
						<Button type='primary' htmlType='submit'>
							Guardar
						</Button>
					</Form.Item>

				</Form>
			</div>
		</div>
	)
}

export default NewPaymentForm
