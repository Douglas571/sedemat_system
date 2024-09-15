import currency from 'currency.js'

export const CurrencyHandler = (value: number | string) => currency(value, 
    { 
        pattern: '#', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
)

export const formatBolivares = (value: number | string) => currency(value, 
    { 
        symbol: 'Bs.', 
        pattern: '# !', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
).format()