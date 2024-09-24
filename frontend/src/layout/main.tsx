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
import type { MenuProps } from 'antd'
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
	padding: 10
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
			key: '/business',
			icon: '',
			label: 'Contribuyentes'
		},
		{
			key: '/contacts',
			icon: '',
			label: 'Contactos'
		},
		{
			key: '/tax-collection',
			icon: '',
			label: 'Recaudación'
		},
		{
			key: '/currency-exchange-rates',
			icon: '',
			label: 'Tasas de Cambio'
		},
		{
			key: '/payments',
			icon: '',
			label: 'Pagos'
		},		
	]

	if (userAuth.user?.role.name === 'Administrador') {
		items.push({
			key: '/users',
			icon: '',
			label: 'Usuarios'
		}, )
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
				style={siderStyle}
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
				<Flex vertical style={{ padding: '16px'}}>
					<Typography.Title level={3} style={{ color: '#ffffffa6'}}>{userName}</Typography.Title>
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
				<Header style={{ padding: 0, background: colorBgContainer }} />

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
