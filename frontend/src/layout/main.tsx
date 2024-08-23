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

const { Header, Content, Footer, Sider } = Layout

const siderStyle: React.CSSProperties = {
	overflow: 'auto',
	height: '100vh',
	position: 'fixed',
	insetInlineStart: 0,
	top: 0,
	bottom: 0,
	scrollbarWidth: 'thin',
	scrollbarColor: 'unset'
}

// const items: MenuProps['items'] = [
//   UserOutlined,
//   VideoCameraOutlined,
//   UploadOutlined,
//   BarChartOutlined,
//   CloudOutlined,
//   AppstoreOutlined,
//   TeamOutlined,
//   ShopOutlined,
// ].map((icon, index) => ({
//   key: String(index + 1),
//   icon: React.createElement(icon),
//   label: `nav ${index + 1}`,
// }));

/**

index
register
tax_collection


 */

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
		label: 'Registro'
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
		<Layout hasSider>
			<Sider style={siderStyle}>
				<div className='demo-logo-vertical' />
				<Menu
					theme='dark'
					mode='inline'
					defaultSelectedKeys={['4']}
					items={items}
					onClick={onClick}
				/>
			</Sider>
			<Layout style={{ marginInlineStart: 200 }}>
				{/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}


				<Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
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
