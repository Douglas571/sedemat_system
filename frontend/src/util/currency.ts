import currency from 'currency.js'

export const CurrencyHandler = (value: number | string) => currency(value, 
    { 
        pattern: '#', 
        precision: 2,
        separator: '.',
        decimal: ','
    }
)

export const CurrencyHandler4 = (value: number | string) => currency(value, 
    { 
        pattern: '#', 
        precision: 4,
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

export const formatPercents = (value: number | string) => 
    currency(
        // currency round the number, so i will take the value with 4 decimals to keep precision, and when i get the number multiply by 100, reduce precision
        currency(value, 
            { 
                symbol: '%', 
                pattern: '# !', 
                precision: 4,
                separator: '.',
                decimal: ','
            }
        )
            .multiply(100)
            .value, 
            { 
                symbol: '%', 
                pattern: '# !', 
                precision: 2,
                separator: '.',
                decimal: ','
            }
).format()