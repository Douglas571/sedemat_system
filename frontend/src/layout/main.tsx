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
import { Layout, Menu, theme } from 'antd'

import {
	Routes,
	Route,
	Outlet,
	Link,
	BrowserRouter,
	useNavigate
} from 'react-router-dom'
import { locale } from 'dayjs'

const { Header, Content, Footer, Sider } = Layout

const siderStyle: React.CSSProperties = {
	// overflow: 'auto',
	//height: '100vh',
	//position: 'fixed',
	// insetInlineStart: 0,
	// top: 0,
	// bottom: 0,
	paddingTop: '64px',
	// scrollbarWidth: 'thin',
	// scrollbarColor: 'unset',
	zIndex: 9000
}

const items: MenuProp['items'] = [
	{
		key: '/',
		icon: '',
		label: 'Inicio',
		route: 'home'
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
		key: '/collection',
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
	}
]

const App: React.FC = () => {
	const navigate = useNavigate()
	const {
		token: { colorBgContainer, borderRadiusLG }
	} = theme.useToken()

	const onClick: MenuProps['onClick'] = data => {
		//     console.log({data})
		navigate(data.key)
	}

	return (
		<Layout>
			<Sider 
				style={siderStyle}
				breakpoint="lg"
				collapsedWidth="0"
				onBreakpoint={(broken) => {
					console.log(broken);
				}}
				onCollapse={(collapsed, type) => {
					console.log(collapsed, type);
				}}
			
			>
				{/* <div className='demo-logo-vertical' /> */}
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
