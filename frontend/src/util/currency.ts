import currency from 'currency.js'

export const CurrencyHandler = (value: number | string) => currency(value, 
    { 
        pattern: '#', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
)

export const percentHandler = (value: number | string) => currency(value, {
    symbol: '%',
    pattern: '# !',
    precision: 4,
    separator: '.',
    decimal: ','
})

export const formatBolivares = (value: number | string) => currency(value, 
    { 
        symbol: 'Bs.', 
        pattern: '# !', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
).format()

export const formatPercents = (value: number | string) => currency(value, 
    { 
        symbol: '%', 
        pattern: '# !', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
).multiply(100).format()