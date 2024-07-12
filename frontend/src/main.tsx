import App from 'App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';


const container = document.querySelector('#root')
if (container) {
	const root = createRoot(container)
	root.render(
		<StrictMode>
			<ConfigProvider locale={esES}>
				<App />
			</ConfigProvider>
		</StrictMode>
	)
}
