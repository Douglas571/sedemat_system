import NewPaymentForm from 'components/NewPaymentForm'
import ViewPayments from 'components/ViewPayments'

import BusinessView from 'pages/BusinessView'
import BusinessNew from 'pages/BusinessNew'
import BusinessEdit from 'pages/BusinessEdit'
import BusinessViewDetails from 'pages/BusinessViewDetails'

import BranchOfficeLicenseNew from 'pages/BranchOfficeLicenseNew'

import { Routes, Route, Outlet, Link, BrowserRouter } from "react-router-dom";


function App(): JSX.Element {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="payments" element={<ViewPayments />} />
						<Route path="payments/new" element={<NewPaymentForm />} />					

						<Route path='business' element={<BusinessView/>}/>
						<Route path='business/new' element={<BusinessNew/>}/>
						<Route path='business/edit/:businessId' element={<BusinessEdit/>}/>
						<Route path='business/:businessId' element={<BusinessViewDetails/>}/>
						<Route path='business/:businessId/branch-office/:branchOfficeId/license/new' element={<BranchOfficeLicenseNew/>}/>
						

						{/* Using path="*"" means "match anything", so this route
						acts like a catch-all for URLs that we don't have explicit
						routes for. */}	
						<Route path="*" element={<NoMatch />} />
					</Route>
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
			  <Link to="/">Inicio</Link>
			</li>
			<li>
			  <Link to="/payments">Pagos</Link>
			</li>
			<li>
			  <Link to="/payments/new">Nuevo Pago</Link>
			</li>
			<li>
				<Link to="/business/">Contribuyentes</Link>
			</li>
			<li>
				<Link to="/business/new">Nuevo Contribuyente</Link>
			</li>
		  </ul>
		</nav>
  
		<hr />
  
		{/* An <Outlet> renders whatever child route is currently active,
			so you can think about this <Outlet> as a placeholder for
			the child routes we defined above. */}
		<Outlet />
	  </div>
	);
  }

  function Home() {
	return (
	  <div>
		<h2>Inicio</h2>
	  </div>
	);
  }
  
  function NoMatch() {
	return (
	  <div>
		<h2>Nothing to see here!</h2>
		<p>
		  <Link to="/">Go to the home page</Link>
		</p>
	  </div>
	);
  }

export default App
