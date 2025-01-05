import React, { useEffect, useState, useMemo } from 'react'
import type { DatePickerProps, FormProps } from 'antd'
import { 
	Upload, 
	Switch, 
	message, 
	Button, 
	DatePicker, 
	Form, 
	Input, 
	InputNumber, 
	Select, 
	AutoComplete, 
	Flex, 
	Typography, 
	Card,
	Image,
} from 'antd'

import { Jimp } from "jimp";

import type { GetProp, UploadFile, UploadProps } from 'antd';

import dayjs from 'dayjs';

import { useParams, useNavigate } from 'react-router-dom';

import * as api from '../util/api'
import { Person, Business, Payment, IBankAccount } from '../util/types';

import * as paymentsApi from '../util/paymentsApi'
import { completeUrl } from './BusinessShared';
import bankAccountService from 'services/bankAccountService';

import useAuthentication from 'hooks/useAuthentication';

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

	const [loading, setLoading] = useState(false);

	let { userAuth } = useAuthentication()

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
	const invertColors = Form.useWatch('invertColors', form)

	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined)
	const [imagePreviewInvertedColorsUrl, setImagePreviewInvertedColorsUrl] = useState<string | undefined>(undefined)

	async function updateImagePreview() {

		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl)
			
		}

		if (fileList.length === 0) {
			return setImagePreviewUrl(undefined)
		}

		const file = fileList[0].originFileObj
		let image: any 

		if (!file) {
			let url = fileList[0].url
			console.log({url})
			setImagePreviewUrl(url)

			return
		}

		setImagePreviewUrl(URL.createObjectURL(new Blob([file])))
	}

	console.log({imagePreviewUrl})

	async function updateInvertedColorsImagePreview() {

		if (imagePreviewInvertedColorsUrl) {
			URL.revokeObjectURL(imagePreviewInvertedColorsUrl)
		}

		if (fileList.length === 0) {
			return setImagePreviewInvertedColorsUrl(undefined)
		}

		if (!fileList[0].originFileObj && fileList[0].url) {
			// get the image from url 
			let image = await Jimp.read(fileList[0].url)

			// invert
			image.invert()

			// get the base64 and set the imagePreviewInvertedColorsUrl
			setImagePreviewInvertedColorsUrl(await image.getBase64("image/png"))
			
		} else {
			const file = new Blob([fileList[0].originFileObj]);

			const reader = new FileReader()

			reader.onload = async function (e) {
				const data = e.target?.result 

				console.log("before manipulating")

				if (!data || !(data instanceof ArrayBuffer)) {
					return 
				}

				console.log('manipulating')

				const image = await Jimp.fromBuffer(data)

				image.invert()

				setImagePreviewInvertedColorsUrl(await image.getBase64("image/png"))
			}

			reader.readAsArrayBuffer(file)
		}
	}

	useEffect(() => {
		updateImagePreview()
		updateInvertedColorsImagePreview()
	}, [fileList])

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
			setLoading(true)
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
			} else if (fileList.length > 0) {
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
				await paymentsApi.updatePayment(newPaymentData, userAuth.token)
			} else {
				// call paymentapi with createPayment()
				await paymentsApi.createPayment(newPaymentData, userAuth.token)
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
		} finally {
			setLoading(false)
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

	// TODO: Pass this function to the paymentsApi module  
	const handleUploadBoucher = async (): Promise<string | undefined> => {
		try {
			console.log("sending files")

			if (fileList.length == 0) {
				throw Error("Selecciona un voucher")
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

			if (!response.ok) {
				let { error } = await response.json()
				throw error
			}
			
			const data = await response.json()

			console.log({ data })

			const imagePath = data.path

			return imagePath

		} catch (error) {
			console.log({ error })

			if (error.name === "FormatNotSupportedError") {
				throw Error("El formato de imagen no es admitido, debe ser .jpeg, .jpg o .png")
			}

			throw error
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
						<Form.Item name='typeOfEntity' label='Origen'
							style={{ minWidth: 100, flex: "20%" }}
						>
							<Select
								options={originTypesOptions}
							/>
						</Form.Item>
						{isABusiness
							? (
								<>
									<Form.Item name='business' label='Comercio'
										rules={[{ required: true, message: 'El comercio es requerido' }]}
										style={{ minWidth: 250, flex: "50%" }}
									>
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
										rules={[{ required: true, message: 'La persona es requerida' }]}
										style={{ minWidth: 250, flex: "50%" }}
									>
										<Select
											options={personOptions}
											showSearch
										/>
									</Form.Item>
								</>
							)
						}
					</Flex>

					<Flex wrap gap={20}>
						<Form.Item<FieldType>
							rules={[
								{ required: true, message: 'Introduzca una referencia' },
								{
									pattern: /^[0-9]*$/,
									message: 'Sólo se permiten números',
								}
							]}
							label='Referencia'
							name='reference'
							style={{flex: 1, minWidth: 200  }}
							
						>
							<Input maxLength={6}/>
						</Form.Item>

						<Form.Item<FieldType>
							rules={[{ required: true, message: 'Introduzca el monto' }]}
							label='Monto'
							name='amount'
							style={{flex: 1, minWidth: 250 }}
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
							style={{flex: 1, minWidth: 250 }}
						>
							<DatePicker onChange={onChange} />
						</Form.Item>

						<Form.Item<FieldType>
							label='Cuentas'
							name='accountId'
							style={{flex: 1, minWidth: 150 }}
						>
							<Select
								optionFilterProp='label'
								// onChange={onChange}
								// onSearch={onSearch}
								options={accounts}
							/>
						</Form.Item>

						<Form.Item label='Método' name='disabled' valuePropName='checked'
							style={{flex: 1, minWidth: 250 }}
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

					<Flex wrap gap={20} style={{ marginBottom: 20 }}>
						<Upload
							name='boucher'
							{...uploadProps}
						>
							<Button>Seleccionar Voucher</Button>
						</Upload>
						<br />

						<Form.Item name='invertColors' label='Invertir Color' valuePropName='checked'>
							<Switch
								checkedChildren='SI'
								unCheckedChildren='NO'
							/>
						</Form.Item>

					</Flex>

					{
						imagePreviewUrl && (
							<>
								<Image 
									src={
										invertColors 
										? imagePreviewInvertedColorsUrl 
										: imagePreviewUrl} />
							</>
						)
					}

					<Form.Item>
						<Button 
							loading={loading} 
							disabled={loading} 
							type='primary' 
							htmlType='submit'>
							Guardar
						</Button>
					</Form.Item>

				</Form>
			</Card>
		</div>
	)
}

export default PaymentsEdit
