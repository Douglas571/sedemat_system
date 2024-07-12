import type { DatePickerProps, FormProps } from 'antd'
import { Alert, message, Button, DatePicker, Form, Input, InputNumber, Select } from 'antd'

const IP = "node-app"
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
	
	async function sendPaymentData(paymentData: FieldType): Promise<string> {
		
			const response = await fetch('http://127.20.0.4:3000/v1/payments', {
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
		reference?: string
		dni?: string
		business_name?: string
		amount: number,
		account: string
	}

	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		
		try {
			await sendPaymentData(values)
		} catch(error) {
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
						rules={[{ required: true, message: 'introduce la razon social!' }]}
						label='Razón Social'
						name='business_name'
						valuePropName='checked'
					>
						<Input />
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
							defaultValue={accounts[0].value}
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

			<Button onClick={throwError}>Error</Button>
		</div>
	)
}

export default NewPaymentForm
