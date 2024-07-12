// import { Button, Table } from 'antd';

// import currency from "currency.js";

// const App = () => {
// 	let data = {
// 		TCMMMV_BCV: 39.59,
// 		totalMMV: 10,
// 	}

// 	let dataSource = [
// 		{
// 			key: '1',
// 			periodo: "abr-24",
// 			incomes: 1000,
// 			taxes: 0 ,
// 			aseo: 0,
// 			minTaxes: 0
// 		},
// 		{
// 			key: '2',
// 			periodo: "may-24",
// 			incomes: 2000,
// 			taxes: 0,
// 			aseo: 0,
// 			minTaxes: 0
// 		},
// 		{
// 			key: '3',
// 			periodo: "jun-24",
// 			incomes: 3999,
// 			taxes: 0,
// 			aseo: 0,
// 			minTaxes: 0
// 		},
// 	];

// 	dataSource = dataSource.map( d => ({...d, taxes: currency(d.incomes).divide(data.TCMMMV_BCV).value }) )
	
// 	const columns = [
// 		{
// 			title: "Periodo",
// 			dataIndex: "periodo",
// 		},
// 		{
// 			title: "Ingresos",
// 			dataIndex: "incomes",
// 			key: "incomes"
// 		},
// 		{
// 			title: "Impuestos",
// 			dataIndex: "taxes",
// 			key: "taxes"
// 		},
// 		{
// 			title: "Impuestos Por Aseo",
// 			dataIndex: "aseo",
// 			key: "aseo"
// 		},
// 		{
// 			title: "Minimo Tributario",
// 			dataIndex: "minTaxes",
// 			key: "minTaxes"
// 		},
		
// 	];


//   return (<div className="App">
// 		<div>
// 			Total a pagar en MMV: {data.totalMMV}
// 		</div>
// 		<div>
// 			Total a pagar en Bs.: {currency(data.totalMMV).multiply(data.TCMMMV_BCV).multiply(100).format({symbol: "", separator: ".", decimal: ",", precision: 2})}
// 		</div>

// 		<Table dataSource={dataSource} columns={columns} />;

//     <Button type="primary">Button</Button>
//   </div>)
// };

// export default App;