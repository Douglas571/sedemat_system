import type {
	DatePickerProps,
	FormProps,
	GetProp,
	UploadFile,
	UploadProps
} from 'antd'
import {
	Button,
	Card,
	DatePicker,
	Flex,
	Form,
	Image,
	Input,
	InputNumber,
	Select,
	Switch,
	Typography,
	Upload,
	message
} from 'antd'
import React, { useEffect, useState } from 'react'

import { Jimp, JimpInstance } from 'jimp'

import dayjs from 'dayjs'

import { useNavigate, useParams } from 'react-router-dom'

import * as api from '../util/api'
import type { Business, IBankAccount, Payment, Person } from '../util/types'

import bankAccountService from 'services/bankAccountService'
import * as paymentsApi from '../util/paymentsApi'
import { completeUrl } from './BusinessShared'

import useAuthentication from 'hooks/useAuthentication'

const IP = process.env.BACKEND_IP || 'localhost'
const PORT = '3000'
const HOST = `http://${IP}:${PORT}`

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
	console.log(date, dateString)
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
	console.log('Failed:', errorInfo)
}

interface Option {
	value: string
	label: string
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface FieldType {
	username?: string
	password?: string
	reference: string
	dni: string
	business_name: string
	amount: number
	account: string
	paymentDate: Date
}

const originTypesOptions = ['Comercio', 'Persona'].map(t => ({
	label: t,
	value: t
}))

const methodNames = ['Transferencia', 'PagoMovil', 'BioPago']
const methods = methodNames.map(method => ({
	value: method,
	label: method
}))

function PaymentsEdit(): JSX.Element {
	const [loading, setLoading] = useState(false)

	const { userAuth } = useAuthentication()

	const [messageApi, contextHolder] = message.useMessage()
	const [form] = Form.useForm()

	const { id } = useParams()

	const [businesses, setBusinesses] = React.useState<Business[]>([])
	const [people, setPeople] = React.useState<Person[]>([])
	const [businessOptions, setBusinessOptions] =
		React.useState<{ label: string; value: string }[]>()
	const [personOptions, setPersonOptions] =
		React.useState<{ label: string; value: string }[]>()
	const [bankAccounts, setBankAccounts] = useState<IBankAccount[]>()

	const navigate = useNavigate()

	const [payment, setPayment] = React.useState<Payment>()

	const [fileList, setFileList] = React.useState<UploadFile[]>([])
	const invertColors = Form.useWatch('invertColors', form)

	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>()
	const [imagePreviewInvertedColorsUrl, setImagePreviewInvertedColorsUrl] =
		useState<string | undefined>()

	async function updateImagePreview() {
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl)
		}

		if (fileList.length === 0) {
			setImagePreviewUrl(undefined)
			return
		}

		const file = fileList[0].originFileObj
		let image: any

		if (!file && fileList[0].url) {
			const { url } = fileList[0]
			setImagePreviewUrl(url)
			return
		}

		setImagePreviewUrl(URL.createObjectURL(new Blob([file])))
	}

	const processImage = async (image: JimpInstance): Promise<void> => {
		image.invert()
		image.normalize()
		image.threshold({ max: 150 });
		image.contrast(0.2)
		setImagePreviewInvertedColorsUrl(await image.getBase64('image/png'))
	}

	async function updateInvertedColorsImagePreview() {
		
		
		if (imagePreviewInvertedColorsUrl) {
			URL.revokeObjectURL(imagePreviewInvertedColorsUrl)
		}

		if (fileList.length === 0) {
			setImagePreviewInvertedColorsUrl(undefined)
			return
		}

		if (!fileList[0].originFileObj && fileList[0].url) {
			// get the image from url
			console.log('before')

			await Jimp.read(fileList[0].url)
				.then(image => processImage(image))
				.catch(error => console.log(error))
		} else {
			const file = new Blob([fileList[0].originFileObj])

			const reader = new FileReader()

			reader.addEventListener('load', element => {
				const data = element.target?.result

				if (data && data instanceof ArrayBuffer) {
					Jimp.fromBuffer(data)
						.then(image => processImage(image))
						.catch(error => console.log(error))
				}
			})

			reader.readAsArrayBuffer(file)
		}
	}

	const [lastImageId, setLastImageId] = useState('')

	useEffect(() => {
		let currentImageId = ''

		if (fileList.length > 0) {
			currentImageId = fileList[0].uid
		}
		
		updateImagePreview()
		
		if (invertColors && currentImageId !== lastImageId) {
			updateInvertedColorsImagePreview()
			setLastImageId(currentImageId)
		}
		
	}, [fileList, invertColors])

	const typeOfEntity = Form.useWatch('typeOfEntity', form)
	const isABusiness = typeOfEntity === 'Comercio'

	// if id is present, set isEditing to true
	const isEditing = id !== undefined

	const accounts = bankAccounts?.map(b => ({
		key: b.id,
		value: b.id,
		label: b.accountNumber.split('-')[4]
	}))

	useEffect(() => {
		if (payment) {
			form.setFieldsValue({
				accountId: payment.bankId
			})
		} else {
			form.setFieldsValue({
				accountId: accounts?.[0].key
			})
		}
	}, [bankAccounts, payment])

	const loadBancAccounts = async () => {
		// fetch with bankAccountService.findAll()
		const fetchedBankAccounts = await bankAccountService.findAll()
		// set the bancAccounts state object
		setBankAccounts(fetchedBankAccounts)

		console.log({ fetchedBankAccounts })
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
		const fetchedPayment = await paymentsApi.fetchPaymentById(id)
		console.log({ fetchedPayment })

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
		console.log({ fetchedPayment })
		if (fetchedPayment.image) {
			const image = await fetch(fetchedPayment.image)
			const imageBlob = await image.blob()
			const imageFile = new File([imageBlob], 'image.jpg', {
				type: imageBlob.type
			})

			imageFile.url = completeUrl(`/${fetchedPayment.image}`)
			setFileList(() => [imageFile])
		}
	}

	async function loadBusiness() {
		const fetchedBusiness = await api.fetchBusiness()

		setBusinesses(fetchedBusiness)
		setBusinessOptions(
			fetchedBusiness.map(b => {
				const text = `${b.dni} | ${b.businessName}`

				return { label: text, value: text }
			})
		)
	}

	async function loadPeople() {
		const fetchedPeople = await api.getPeople()

		setPeople(fetchedPeople)
		setPersonOptions(
			fetchedPeople.map(p => {
				const text = `${p.dni} | ${p.firstName} ${p.lastName}`

				return { label: text, value: text }
			})
		)
	}

	function getPersonFromOption(option: string, people: Person[]) {
		// Extract the dni from the option string (before the " | ")
		const dni = option.split(' | ')[0]

		// Find the person with the matching dni
		return people.find(person => person.dni === dni)
	}

	function getBusinessFromOption(option: string, businesses: Business[]) {
		// The option is assumed to be the business name
		const businessName = option.split(' | ')[1]

		// Find the business with the matching name
		return businesses.find(business => business.businessName === businessName)
	}

	const onFinish: FormProps<FieldType>['onFinish'] = async values => {
		try {
			setLoading(true)
			let boucherImageUrl = ''
			const hasImage = fileList.length > 0
			const shouldConserveImage =
				payment?.image &&
				fileList[0]?.url?.includes(payment.image) &&
				!invertColors

			if (!values.person && !values.business) {
				message.error('El pago no tiene una persona o comercio asociado')
				return ''
			}

			if (!hasImage) {
				throw new Error('Selecciona un voucher')
			}

			if (shouldConserveImage) {
				console.log('using existing image')
				boucherImageUrl = payment.image
			} else {
				console.log('uploading image')
				boucherImageUrl = await handleUploadBoucher()
			}

			// map all values to a ready to ship payment object
			const bank = bankAccounts.find(b => b.id === values.accountId)

			const newPaymentData: Payment = {
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
				newPaymentData.businessId = getBusinessFromOption(
					values.business,
					businesses
				)?.id

				if (payment?.personId) {
					newPaymentData.personId = null
				}
			} else {
				console.log(values.person)
				newPaymentData.personId = getPersonFromOption(values.person, people)?.id

				if (payment?.businessId) {
					newPaymentData.businessId = null
				}
			}

			console.log({ newPaymentData })

			// if is editing, update payment
			if (isEditing) {
				// call paymentapi with updatePayment()
				await paymentsApi.updatePayment(newPaymentData, userAuth.token)
			} else {
				// call paymentapi with createPayment()
				await paymentsApi.createPayment(newPaymentData, userAuth.token)
			}

			message.success('Pago guardado exitosamente')

			navigate(-1)

			// cleanDataFromForm()
		} catch (error) {
			console.log({ error })
			// process errors

			// if reference is duplicated

			// if reference is malformed

			// if business is not registered

			// other unexpected errors
			message.error(error.message)
			setLoading(false)
		} finally {
			setLoading(false)
		}
	}

	function filterBusinessNames(
		businesses: Business[],
		searchText: string
	): Business[] {
		// Convert the search text to lowercase for case-insensitive search
		const lowerCaseSearchText = searchText.toLowerCase()

		// Filter the business objects
		return businesses.filter(business =>
			business.businessName.toLowerCase().includes(lowerCaseSearchText)
		)
	}

	const uploadProperties: UploadProps = {
		onRemove: file => {
			const index = fileList.indexOf(file)
			const newFileList = [...fileList]
			newFileList.splice(index, 1)
			setFileList(newFileList)
		},
		beforeUpload: file => {
			console.log('adding files')
			setFileList([...fileList, file])

			return false
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
			console.log('sending files')

			if (fileList.length === 0) {
				throw new Error('Selecciona un voucher')
			}

			const formData = new FormData()

			const originalFile = fileList[0].originFileObj

			if (invertColors && imagePreviewInvertedColorsUrl) {
				// generate a blog from imagePreviewInvertedColorsUrl
				console.log({ imagePreviewInvertedColorsUrl })

				const response = await fetch(imagePreviewInvertedColorsUrl)
				const blob = await response.blob()

				const file = new File([blob], `${String(Date.now())}.png`, {
					type: 'image/png'
				})

				formData.append('image', file)
			} else {
				// append the original file object
				formData.append('image', originalFile)
			}

			const response = await fetch(`${HOST}/v1/payments/upload`, {
				method: 'POST',
				body: formData
			})

			if (!response.ok) {
				const { error } = await response.json()
				throw error
			}

			const data = await response.json()

			console.log({ data })

			const imagePath = data.path

			return imagePath
		} catch (error) {
			console.log({ error })

			if (error.name === 'FormatNotSupportedError') {
				throw new Error(
					'El formato de imagen no es admitido, debe ser .jpeg, .jpg o .png'
				)
			}

			throw error
		}
	}

	return (
		<div>
			<Card
				title={
					<Typography.Title level={2}>
						{isEditing ? 'Editando Pago' : 'Nuevo Pago'}
					</Typography.Title>
				}
			>
				{contextHolder}

				<Form
					form={form}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					initialValues={{
						typeOfEntity: 'Comercio'
					}}
				>
					<Flex gap={20} wrap>
						<Form.Item
							name='typeOfEntity'
							label='Origen'
							style={{ minWidth: 100, flex: '20%' }}
						>
							<Select options={originTypesOptions} />
						</Form.Item>
						{isABusiness ? (
							<Form.Item
								name='business'
								label='Comercio'
								rules={[
									{ required: true, message: 'El comercio es requerido' }
								]}
								style={{ minWidth: 250, flex: '50%' }}
							>
								<Select options={businessOptions} showSearch />
							</Form.Item>
						) : (
							<Form.Item
								name='person'
								label='Persona'
								rules={[{ required: true, message: 'La persona es requerida' }]}
								style={{ minWidth: 250, flex: '50%' }}
							>
								<Select options={personOptions} showSearch />
							</Form.Item>
						)}
					</Flex>

					<Flex wrap gap={20}>
						<Form.Item<FieldType>
							rules={[
								{ required: true, message: 'Introduzca una referencia' },
								{
									pattern: /^\d*$/,
									message: 'Sólo se permiten números'
								}
							]}
							label='Referencia'
							name='reference'
							style={{ flex: 1, minWidth: 200 }}
						>
							<Input maxLength={6} />
						</Form.Item>

						<Form.Item<FieldType>
							rules={[{ required: true, message: 'Introduzca el monto' }]}
							label='Monto'
							name='amount'
							style={{ flex: 1, minWidth: 250 }}
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
							name='paymentDate'
							style={{ flex: 1, minWidth: 250 }}
						>
							<DatePicker onChange={onChange} />
						</Form.Item>

						<Form.Item<FieldType>
							label='Cuentas'
							name='accountId'
							style={{ flex: 1, minWidth: 150 }}
						>
							<Select
								optionFilterProp='label'
								// onChange={onChange}
								// onSearch={onSearch}
								options={accounts}
							/>
						</Form.Item>

						<Form.Item
							label='Método'
							name='disabled'
							valuePropName='checked'
							style={{ flex: 1, minWidth: 250 }}
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
						<Upload name='boucher' {...uploadProperties}>
							<Button>Seleccionar Voucher</Button>
						</Upload>
						<br />

						<Form.Item
							name='invertColors'
							label='Invertir Color'
							valuePropName='checked'
						>
							<Switch checkedChildren='SI' unCheckedChildren='NO' />
						</Form.Item>
					</Flex>

					{imagePreviewUrl ? (
						<Image
							src={
								invertColors ? imagePreviewInvertedColorsUrl : imagePreviewUrl
							}
						/>
					) : null}

					<Form.Item>
						<Button
							loading={loading}
							disabled={loading}
							type='primary'
							htmlType='submit'
						>
							Guardar
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	)
}

export default PaymentsEdit
