import React from 'react'
import {
	AppstoreOutlined,
	BarChartOutlined,
	CloudOutlined,
	ShopOutlined,
	TeamOutlined,
	UploadOutlined,
	UserOutlined,
	VideoCameraOutlined
} from '@ant-design/icons'
import type { MenuProps, ItemType } from 'antd'
import { Layout, Menu, theme, Typography, Flex, Divider } from 'antd'

import {
	Routes,
	Route,
	Outlet,
	Link,
	BrowserRouter,
	useNavigate
} from 'react-router-dom'
import { locale } from 'dayjs'
import useAuthentication from 'hooks/useAuthentication'

import ROLES from '../util/roles'

const { Header, Content, Footer, Sider } = Layout

const siderStyle: React.CSSProperties = {
	// overflow: 'auto',
	//height: '100vh',
	//position: 'fixed',
	// insetInlineStart: 0,
	// top: 0,
	// bottom: 0,
	// paddingTop: '64px',
	// scrollbarWidth: 'thin',
	// scrollbarColor: 'unset',
	zIndex: 9000,
	//padding: 10
}

const App: React.FC = () => {
	const navigate = useNavigate()
	const {
		token: { colorBgContainer, borderRadiusLG }
	} = theme.useToken()

	const onClick: MenuProps['onClick'] = data => {
		// console.log({data})
		navigate(data.key)
	}

	const { userAuth } = useAuthentication()

	const items: MenuProps['items'] = [
		{
			key: '/',
			icon: '',
			label: 'Inicio',
		},
		{
			key: '/pending-works',
			icon: '',
			label: 'Trabajos Pendientes',
		},
		{
			key: '/register',
			icon: '',
			label: 'Registro',
			children: [
				{
					key: '/business/by-economic-activity',
					icon: '',
					label: 'Indice',
				},
				{
					key: '/business',
					icon: '',
					label: 'Contribuyentes'
				},
				{
					key: '/contacts',
					icon: '',
					label: 'Contactos'
				},
			]
		},
		{
			key: '/tax-collection-general',
			icon: '',
			label: 'Recaudación',
			children: [
				{
					key: '/tax-collection',
					icon: '',
					label: 'Contribuyentes'
				},
				{
					key: '/tax-collection/gross-incomes',
					icon: '',
					label: 'Declaraciones de Ingresos'
				},
				{
					key: '/settlements',
					icon: '',
					label: 'Liquidaciones'
				},
				{
					key: '/payments',
					icon: '',
					label: 'Pagos'
				},
			]
		},
	]


	let reportsItem: ItemType = {
		key: '/reports',
		icon: '',
		label: 'Reportes',
		children: []
	}

	let grossIncomeSummaryReportItem = {
		key: '/reports/gross-income-summary',
		icon: '',
		label: 'Resumen de Declaraciones de Ingresos',
	}

	reportsItem.children?.push(grossIncomeSummaryReportItem)

	if (userAuth.user?.roleId === ROLES.COLLECTOR) {
		items.push(reportsItem)
	}

	if (userAuth.user?.roleId === ROLES.LEGAL_ADVISOR || userAuth.user?.roleId === ROLES.FISCAL) { // LEGAL ADVISOR
		reportsItem.children?.push({
			key: '/reports/gross-income-status',
			icon: '',
			label: 'Declaraciones de Ingresos'
		})

		items.push(reportsItem)
	}

	items.push({
		key: '/config',
		icon: '',
		label: 'Configuración',
		children: [
			{
				key: '/economic-activities',
				icon: '',
				label: 'Actividades Económicas'
			},
			{
				key: '/currency-exchange-rates',
				icon: '',
				label: 'Tasas de Cambio'
			},
			{
				key: '/bank-accounts',
				icon: '',
				label: 'Cuentas de Banco'
			}
		]
	})

	if (userAuth.user?.role.name === 'Administrador') {
		const configItem = items.find(i => i?.key === '/config')
		if (configItem) {
			
			configItem.children?.push({
				key: '/users',
				icon: '',
				label: 'Usuarios'
			})

			
		}
	}
	if (userAuth.token) {
		items.push({
			key: '/logout',
			icon: '',
			label: 'Cerrar Sesión'
		})
	}

	let userName = userAuth.user?.person ? `${userAuth.user?.person.firstName} ${userAuth.user?.person.lastName}` : userAuth.user?.username
	let roleName = userAuth.user?.role.name
	

	return (
		<Layout>
			<Sider 
				//style={siderStyle}
				breakpoint="lg"
				collapsedWidth="0"
				onBreakpoint={(broken) => {
					// console.log(broken);
				}}
				onCollapse={(collapsed, type) => {
					// console.log(collapsed, type);
				}}
			
			>
				{/* <div className='demo-logo-vertical' /> */}
				<Flex vertical style={{ 
						padding: '16px'
				}}>
					<Typography.Title level={3} style={{ color: '#ffffffa6'}}>
						{userName}
					</Typography.Title>
					<Typography.Text type='secondary' style={{ color: '#ffffffa6'}}>{roleName}</Typography.Text>
				</Flex>

				<Divider style={{ backgroundColor: '#ffffffa6'}} />

				<Menu
					theme='dark'
					mode='inline'
					defaultSelectedKeys={['4']}
					items={items}
					onClick={onClick}
				/>
			</Sider>
			<Layout 
				style={{ minHeight: '100vh' }}
			>
				<Header style={{ 
					padding: 0, 
					background: colorBgContainer 
				}} 
				/>

				<Content 
					style={{ 
						margin: '24px 16px 0', 
						//overflow: 'initial' 
					}}>
					<Outlet />
				</Content>



				<Footer style={{ textAlign: 'center' }}>
					SEDEMAT Zamora ©{new Date().getFullYear()} Creado por Douglas Socorro
				</Footer>
			</Layout>
		</Layout>
	)
}

export default App
