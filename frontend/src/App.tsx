import 'index.css'


import UserHome from 'pages/UserHome';

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
import TaxCollectionBusinessGrossIncomes from 'pages/GrossIncomesNew'
import GrossIncomesEdit from 'pages/GrossIncomesEdit'
import TaxCollectionBusinessGrossIncomesInvoice from 'pages/TaxCollectionBusinessGrossIncomesInvoice'

import EconomicActivityEdit from 'pages/EconomicActivityEdit';
import EconomicActivityAll from 'pages/EconomicActivityAll';

import GrossIncomes from 'pages/GrossIncomes'
import GrossIncomeDetails from 'pages/GrossIncomeDetails'
import GrossIncomeInvoiceEdit from 'pages/GrossIncomeInvoiceEdit'

import PrintableGrossIncomeInvoice from 'pages/printable/PrintableGrossIncomeInvoice'
import PrintableGrossIncomeInvoiceSettlement from 'pages/printable/PrintableGrossIncomeInvoiceSettlement'

import BankAccounts from 'pages/BankAccounts'
import BankAccountsEdit from 'pages/BankAccountsEdit'

import LoginForm from 'pages/Login'
import SingUpForm from 'pages/SingUp'

import Users from 'pages/Users'
import UsersEdit from 'pages/UsersEdit'


import { Routes, Route, Outlet, Link, BrowserRouter, useNavigate, Navigate} from 'react-router-dom'
import AuthenticationProvider from "./contexts/AuthenticationProvider";
import useAuthentication from "./hooks/useAuthentication";

import MainLayout from 'layout/main'
import Logout from 'pages/Logout';

import ReportsBusinessesGrossIncomeStatus from 'pages/ReportsBusinessesGrossIncomeStatus';
import ReportsBusinessesGrossIncomeSummary from 'pages/ReportsBusinessesGrossIncomeSummary';

function App(): JSX.Element {
	return (
		<div>
			<AuthenticationProvider>
				<BrowserRouter>
					<Routes>
						<Route path='/' element={<AdministrativeGuardRoute/>}>

							<Route element={<MainLayout />}>

								{/* <Route index element={<Home />} /> */}

								<Route index element={<UserHome />} />
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

								<Route path='tax-collection/:businessId/gross-incomes/new' element={<GrossIncomesEdit />} />
								<Route path='tax-collection/:businessId/gross-incomes/:grossIncomeId' element={<GrossIncomeDetails />} />
								<Route path='tax-collection/:businessId/gross-incomes/:grossIncomeId/edit' element={<GrossIncomesEdit />} />

								<Route path='tax-collection/:businessId/gross-incomes-invoice/new' element={<GrossIncomeInvoiceEdit />} />
								<Route path='tax-collection/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId' element={<TaxCollectionBusinessGrossIncomesInvoice />} />
								<Route path='tax-collection/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId/edit' element={<GrossIncomeInvoiceEdit />} />

								<Route path='tax-collection/gross-incomes' element={<GrossIncomes/>} />


								<Route path='users' element={<Users />} />
								<Route path='users/new' element={<UsersEdit />} />
								<Route path='users/:userId/edit' element={<UsersEdit />} />


								<Route path='economic-activities' element={<EconomicActivityAll/>}/>
								<Route path='economic-activities/:economicActivityId' element={(<h1>Economic Activity Details</h1>)}/>
								<Route path='economic-activities/new' element={<EconomicActivityEdit />} />
								<Route path='economic-activities/:economicActivityId/edit' element={<EconomicActivityEdit />} />

								<Route path='bank-accounts' element={<BankAccounts/>}/>
								<Route path='bank-accounts/new' element={<BankAccountsEdit/>}/>
								<Route path='bank-accounts/:bankAccountId/edit' element={<BankAccountsEdit/>}/>

								<Route path='reports/gross-income-status' element={<ReportsBusinessesGrossIncomeStatus/>}/>
								<Route path='reports/gross-income-summary' element={<ReportsBusinessesGrossIncomeSummary/>}/>
								
								
							</Route>
							

							{/* Using path="*"" means "match anything", so this route
							acts like a catch-all for URLs that we don't have explicit
							routes for. */}
							<Route path='*' element={<NoMatch />} />
						</Route>

						<Route path='/printable/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId' element={<PrintableGrossIncomeInvoice />} />
						<Route path='/printable/:businessId/gross-incomes-invoice/:grossIncomeInvoiceId/settlement' element={<PrintableGrossIncomeInvoiceSettlement />} />


						<Route path={'/login'} element={<LoginForm/>}/>
						<Route path={'/logout'} element={<Logout/>}/>
						<Route path={'/singup'} element={<SingUpForm/>}/>
					</Routes>
				</BrowserRouter>
			</AuthenticationProvider>
		</div>
	)
}



const AdministrativeGuardRoute = () => {
  	const {	userAuth } = useAuthentication();

  	return userAuth.token ? <Outlet /> : <Navigate to="/login" />;
};

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
