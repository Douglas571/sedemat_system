import BusinessView from 'pages/BusinessView'
import BusinessViewDetails from 'pages/BusinessViewDetails'

import EconomicLicenseEdit from 'pages/EconomicLicenseEdit'

import Contacts from 'pages/Contacts'
import ContactsView from 'pages/ContactsView'
import ContactEdit from 'pages/ContactsEdit'


import BranchOfficeEdit from 'pages/BranchOfficeEdit'
// TODO: Rename the file
import NewBusinessForm from 'pages/BusinessCombinedEditNew'

import CurrencyExchangeRatesPage from 'pages/CurrencyExchangeRates'
import CurrencyExchangeRatesEditForm from 'pages/CurrencyExchangeRatesEditForm';

import Payments from 'pages/Payments'
import PaymentsEdit from 'pages/PaymentsEdit'

import TaxCollection from 'pages/TaxCollection'
import TaxCollectionBusinessDetails from 'pages/TaxCollectionBusinessDetails'
import TaxCollectionBusinessGrossIncomes from 'pages/TaxCollectionBusinessGrossIncomesEdit'
import TaxCollectionBusinessGrossIncomesInvoice from 'pages/TaxCollectionBusinessGrossIncomesInvoice'
import GrossIncomeDetails from 'pages/GrossIncomeDetails'

import GrossIncomeInvoiceEdit from 'pages/GrossIncomeInvoiceEdit'

import PrintableGrossIncomeInvoice from 'pages/PrintableGrossIncomeInvoice'
import PrintableGrossIncomeInvoiceSettlement from 'pages/PrintableGrossIncomeInvoiceSettlement'


import { Routes, Route, Outlet, Link, BrowserRouter } from 'react-router-dom'

import MainLayout from 'layout/main'

function App(): JSX.Element {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<MainLayout />}>
						{/* <Route index element={<Home />} /> */}

						<Route index element={<Home />} />

						<Route path='payments' element={<Payments />} />
						<Route path='payments/new' element={<PaymentsEdit />} />
						<Route path='payments/:id' element={<PaymentsEdit />} />
						
						<Route path='business' element={<BusinessView />} />
						<Route path='business/new' element={<NewBusinessForm />}/>
						<Route path='business/edit/:businessId' element={<NewBusinessForm />}/>
						<Route path='business/:businessId' element={<BusinessViewDetails />}/>
						<Route path='businesses/:businessId/branch-offices/new' element={<BranchOfficeEdit />}/>
						<Route path='businesses/:businessId/branch-offices/:branchOfficeId/edit' element={<BranchOfficeEdit />}/>

						<Route path='business/:businessId/licenses/new' element={<EconomicLicenseEdit />}/>
						<Route path='business/:businessId/licenses/:licenseId/edit' element={<EconomicLicenseEdit />}/>

						<Route path='contacts' element={<Contacts/>}/>
						<Route path='contacts/:id' element={<ContactsView/>}/>
						<Route path='contacts/new' element={<ContactEdit/>}/>
						<Route path='contacts/:contactId/edit' element={<ContactEdit/>}/>

						<Route path='currency-exchange-rates' element={<CurrencyExchangeRatesPage />} />
						<Route path='currency-exchange-rates/new' element={<CurrencyExchangeRatesEditForm />} />
						<Route path='currency-exchange-rates/edit/:id' element={<CurrencyExchangeRatesEditForm />} />

						<Route path='tax-collection' element={<TaxCollection />} />
						<Route path='tax-collection/:businessId' element={<TaxCollectionBusinessDetails />} />

						<Route path='tax-collection/:businessId/gross-incomes/new' element={<TaxCollectionBusinessGrossIncomes />} />
						<Route path='tax-collection/:businessId/gross-incomes/:grossIncomeId' element={<GrossIncomeDetails />} />
						<Route path='tax-collection/:businessId/gross-incomes/:grossIncomeId/edit' element={<TaxCollectionBusinessGrossIncomes />} />

						<Route path='tax-collection/:businessId/gross-incomes-invoice/new' element={<GrossIncomeInvoiceEdit />} />
						<Route path='tax-collection/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId' element={<TaxCollectionBusinessGrossIncomesInvoice />} />
						<Route path='tax-collection/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId/edit' element={<GrossIncomeInvoiceEdit />} />

						{/* Using path="*"" means "match anything", so this route
						acts like a catch-all for URLs that we don't have explicit
						routes for. */}
						<Route path='*' element={<NoMatch />} />
					</Route>

					<Route path='/printable/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId' element={<PrintableGrossIncomeInvoice />} />
					<Route path='/printable/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId/settlement' element={<PrintableGrossIncomeInvoiceSettlement />} />
				</Routes>
			</BrowserRouter>
		</div>
	)
}

function Layout() {
	return (
		<div>
			{/* A "layout route" is a good place to put markup you want to
			share across all the pages on your site, like navigation. */}
			<nav>
				<ul>
					<li>
						<Link to='/'>Inicio</Link>
					</li>
					<li>
						<Link to='/payments'>Pagos</Link>
					</li>
					<li>
						<Link to='/payments/new'>Nuevo Pago</Link>
					</li>
					<li>
						<Link to='/business/'>Contribuyentes</Link>
					</li>
					<li>
						<Link to='/business/new'>Nuevo Contribuyente</Link>
					</li>
				</ul>
			</nav>

			<hr />

			{/* An <Outlet> renders whatever child route is currently active,
			so you can think about this <Outlet> as a placeholder for
			the child routes we defined above. */}
			<Outlet />
		</div>
	)
}

function Home() {
	return (
		<div>
			<h2>Inicio</h2>
		</div>
	)
}

function NoMatch() {
	return (
		<div>
			<h2>Nada que ver aquí!</h2>
			<p>
				<Link to='/'>Volver al inicio</Link>
			</p>
		</div>
	)
}

export default App
