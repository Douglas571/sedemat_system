import React, { useEffect, useState } from 'react'
import type { DatePickerProps, FormProps } from 'antd'
import { Upload, Switch, message, Button, DatePicker, Form, Input, InputNumber, Select, AutoComplete, Flex, Typography, Card } from 'antd'
import FormItemLabel from 'antd/es/form/FormItemLabel'

import type { GetProp, UploadFile, UploadProps } from 'antd';

import dayjs from 'dayjs';

import { useParams, useNavigate } from 'react-router-dom';

import * as api from '../util/api'
import { Person, Business, Payment, IBankAccount } from '../util/types';

import * as paymentsApi from '../util/paymentsApi'
import { completeUrl } from './BusinessShared';
import bankAccountService from 'services/bankAccountService';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
	console.log(date, dateString)
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
	console.log('Failed:', errorInfo)
}

type Option = {
	value: string,
	label: string
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

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

const originTypesOptions = ['Comercio', 'Persona'].map(t => ({ label: t, value: t }))

const methodNames = ['Transferencia', 'PagoMovil', 'BioPago'];
const methods = methodNames.map(method => ({
	value: method,
	label: method
}))

function PaymentsEdit(): JSX.Element {

	const [messageApi, contextHolder] = message.useMessage()
	const [form] = Form.useForm();

	const { id } = useParams()

	const [businesses, setBusinesses] = React.useState<Business[]>([])
	const [people, setPeople] = React.useState<Person[]>([])
	const [businessOptions, setBusinessOptions] = React.useState<Array<{ label: string, value: string }>>()
	const [personOptions, setPersonOptions] = React.useState<Array<{ label: string, value: string }>>()
	const [bankAccounts, setBankAccounts] = useState<IBankAccount[]>()

	
	const navigate = useNavigate()

	const [payment, setPayment] = React.useState<Payment>()

	const [fileList, setFileList] = React.useState<UploadFile[]>([]);

	const typeOfEntity = Form.useWatch('typeOfEntity', form)
	const isABusiness = typeOfEntity === 'Comercio'

	// if id is present, set isEditing to true
	const isEditing = id !== undefined

	
	const accounts = bankAccounts?.map(b => ({
		key: b.id,
		value: b.id,
		label: b.accountNumber.split('-')[4]
	}));

	useEffect(() => {
		if (payment) {
			form.setFieldsValue({
				accountId: payment?.bankId,
			})
		} else {
			form.setFieldsValue({
				accountId: accounts && accounts[0].key,
			})
		}
	}, [bankAccounts, payment])

	const loadBancAccounts = async () => {
		// fetch with bankAccountService.findAll()
		const fetchedBankAccounts = await bankAccountService.findAll()
		// set the bancAccounts state object 
		setBankAccounts(fetchedBankAccounts)

		console.log({fetchedBankAccounts})
	}

	useEffect(() => {
		loadBancAccounts()
		loadBusiness()
		loadPeople()

		// if is editing, load the payment
		if (isEditing) {
			loadPayment()
		}
	}, [])

	async function loadPayment() {
		// this function will load the payment data
		// load the data into the form 

		// Fetch payment data
		let fetchedPayment = await paymentsApi.fetchPaymentById(id)
		console.log({ fetchedPayment });

		setPayment(fetchedPayment)

		const initialValues = {
			...fetchedPayment
		}

		initialValues.paymentDate = dayjs(fetchedPayment.paymentDate)

		// Format options for person or business
		if (fetchedPayment.person) {
			const personText = `${fetchedPayment.person.dni} | ${fetchedPayment.person.firstName} ${fetchedPayment.person.lastName}`
			initialValues.person = personText
			initialValues.typeOfEntity = 'Persona'

		} else if (fetchedPayment.business) {
			const businessText = `${fetchedPayment.business.dni} | ${fetchedPayment.business.businessName}`
			initialValues.business = businessText
			initialValues.typeOfEntity = 'Comercio'

		}

		// set the form values using an object
		form.setFieldsValue(initialValues)

		// download the image and set it into filelist
		console.log({fetchedPayment})
		if (fetchedPayment.image) {
			const image = await fetch(fetchedPayment.image)
			const imageBlob = await image.blob()
			const imageFile = new File([imageBlob], 'image.jpg', { type: imageBlob.type })
		
			imageFile.url = completeUrl('/' + fetchedPayment.image)
			setFileList(() => [imageFile])
		}
	}

	async function loadBusiness() {
		let fetchedBusiness = await api.fetchBusiness()

		setBusinesses(fetchedBusiness)
		setBusinessOptions(fetchedBusiness.map((b) => {
			let text = `${b.dni} | ${b.businessName}`

			return { label: text, value: text }
		}))
	}

	async function loadPeople() {
		let fetchedPeople = await api.getPeople()

		setPeople(fetchedPeople)
		setPersonOptions(fetchedPeople.map(p => {
			let text = `${p.dni} | ${p.firstName} ${p.lastName}`

			return { label: text, value: text }
		}))
	}

	function getPersonFromOption(option: string, people: Person[]) {
		// Extract the dni from the option string (before the " | ")
		const dni = option.split(' | ')[0];

		// Find the person with the matching dni
		return people.find(person => person.dni === dni);
	}

	function getBusinessFromOption(option: string, businesses: Business[]) {
		// The option is assumed to be the business name
		const businessName = option.split(' | ')[1];

		// Find the business with the matching name
		return businesses.find(business => business.businessName === businessName);
	}

	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		try {

			// get the image 
			// send the image to the server
			// get the id of the image

			//console.log({bankAccounts, accounts, values})
			//return 


			let boucherImageUrl = ''

			if (!values.person && !values.business) { 
				message.error("El pago no tiene una persona o comercio asociado")
				return ''
			}

			if (fileList.length === 0) {
				message.error("Selecciona un boucher")
				return ''
			}

			// if there is not image, upload the image
			// console.log({fileList})
			if (fileList[0]?.url?.includes(payment?.image)) {
				console.log("using existing image")
				boucherImageUrl = payment?.image
			} else {
				console.log("uploading image")
				boucherImageUrl = await handleUploadBoucher()
			}
			console.log({boucherImageUrl})

			// map all values to a ready to ship payment object
			const bank = bankAccounts.find(b => b.id === values.accountId)

			// if (!bank?.id) {
			// 	throw Error('Banco inválido')
			// }

			
			
			let newPaymentData: Payment = {
				id: Number(id),
				...payment,
				reference: values.reference,
				amount: values.amount,
				account: bank?.accountNumber,
				paymentDate: values.paymentDate,
				image: boucherImageUrl,
				
				bankId: values.accountId
			}

			if (isABusiness) {
				console.log(values.business)
				newPaymentData.businessId = getBusinessFromOption(values.business, businesses)?.id

				if(payment?.personId) {
					newPaymentData.personId = null
				}
			} else {
				console.log(values.person)
				newPaymentData.personId = getPersonFromOption(values.person, people)?.id

				if(payment?.businessId) {
					newPaymentData.businessId = null
				}
			}

			console.log({newPaymentData})

			// if is editing, update payment 
			if (isEditing) {
				// call paymentapi with updatePayment()
				await paymentsApi.updatePayment(newPaymentData)
			} else {
				// call paymentapi with createPayment()
				await paymentsApi.createPayment(newPaymentData)
			}

			message.success("Pago guardado exitosamente")

			navigate(-1)

			// cleanDataFromForm()

		} catch (error) {
			console.log({error})
			// process errors

			// if reference is duplicated

			// if reference is malformed 

			// if business is not registered 

			// other unexpected errors
			message.error(error.message)
		}


	}

	function filterBusinessNames(businesses: Business[], searchText: string): Business[] {
		// Convert the search text to lowercase for case-insensitive search
		const lowerCaseSearchText = searchText.toLowerCase();

		// Filter the business objects
		return businesses.filter(business =>
			business.businessName.toLowerCase().includes(lowerCaseSearchText)
		);
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
		onChange: ({ fileList: newFileList }) => {
			setFileList(newFileList)
		},
		fileList,
		maxCount: 1
	}

	const handleUploadBoucher = async (): Promise<string | undefined> => {
		try {
			console.log("sending files")

			if (fileList.length == 0) {
				throw Error("Selecciona un boucher")
			}

			const formData = new FormData()
			fileList.forEach((file) => {
				console.log({file})
				formData.append('image', file.originFileObj);
			})

			const response = await fetch(`${HOST}/v1/payments/upload`, {
				method: 'POST',
				body: formData,
			})

			console.log("response")
			const data = await response.json()
			console.log({ data })
			const imagePath = data.path

			return imagePath

		} catch (error) {
			console.log({ error })
			console.log("hubo un error con la imagen")

			messageApi.open({
				type: 'error',
				content: error.message,
			});
		}
	}

	return (
		<div>
			<Card
				title={<Typography.Title level={2}>{isEditing ? "Editando Pago" : "Nuevo Pago"}</Typography.Title>}
			
			>
				{contextHolder}

				

				<Form form={form}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}

					initialValues={{
						typeOfEntity: 'Comercio',
					}}
				>

					<Flex gap={20} wrap>
						<Form.Item name='typeOfEntity' label='Origen'>
							<Select
								options={originTypesOptions}
							/>
						</Form.Item>
						{isABusiness
							? (
								<>
									<Form.Item name='business' label='Comercio'
										rules={[{ required: true, message: 'El comercio es requerido' }]}
										style={{ flex: '30%' }}>
										<Select
											options={businessOptions}
											showSearch
										/>
									</Form.Item>
								</>
							)
							: (
								<>
									<Form.Item name='person' label='Persona'
										style={{ flex: '60%' }}>
										<Select
											options={personOptions}
											showSearch
										/>
									</Form.Item>
								</>
							)
						}
					</Flex>

					<Flex wrap>
						<Form.Item<FieldType>
							rules={[{ required: true, message: 'Introduzca una referencia' }]}
							label='Referencia'
							name='reference'
							style={{ marginRight: '20px' }}
						>
							<InputNumber maxLength={6} min={0}/>
						</Form.Item>

						<Form.Item<FieldType>
							rules={[{ required: true, message: 'Introduzca el monto' }]}
							label='Monto'
							name='amount'
							style={{ marginRight: '20px' }}
						>
							<InputNumber
								addonAfter='Bs'
								defaultValue={0}
								min={0}
								step={0.01}
								decimalSeparator=','
							/>
						</Form.Item>

						<Form.Item<FieldType>
							rules={[{ required: true, message: 'Seleccione una referencia' }]}
							label='Fecha de Pago'
							name="paymentDate"
							style={{ marginRight: '20px' }}
						>
							<DatePicker onChange={onChange} />
						</Form.Item>

						<Form.Item<FieldType>
							label='Cuentas'
							name='accountId'
							style={{ marginRight: '20px', minWidth: '150px' }}
						>
							<Select
								optionFilterProp='label'
								// onChange={onChange}
								// onSearch={onSearch}
								options={accounts}
							/>
						</Form.Item>

						<Form.Item label='Método' name='disabled' valuePropName='checked'
							style={{ marginRight: '20px' }}
						>
							<Select
								defaultValue={methods[0].value}
								optionFilterProp='label'
								// onChange={onChange}
								// onSearch={onSearch}
								options={methods}
							/>
						</Form.Item>
					</Flex>








					<div>
						<Upload
							name='boucher'
							{...uploadProps}
						>
							<Button>Seleccionar Boucher</Button>
						</Upload>
						<br />
					</div>

					<Form.Item>
						<Button type='primary' htmlType='submit'>
							Guardar
						</Button>
					</Form.Item>

				</Form>
			</Card>
		</div>
	)
}

export default PaymentsEdit
