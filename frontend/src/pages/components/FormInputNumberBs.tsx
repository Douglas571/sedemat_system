import { InputNumber } from "antd"

import currency from "currency.js"

const DEFAULT_PRECISION = 2

let parser = (value: string | number, options: { precision: number }) => {
    return currency(value, { 
        pattern: '#', 
        decimal: ",", 
        separator: '.', 
        precision: options?.precision ?? DEFAULT_PRECISION
    })
}

export default function CustomInputNumber(props: any | { precision: number}) {
    
    let {precision} = props

    if (props?.step <= 0.0001) {
        precision = 4
    }

    return <InputNumber
        step={0.01}

        decimalSeparator=','

        // onInput={(value) => console.log({inputValue: value})}
        
        parser={(value) => {
            // console.log({parserValue: value})
            return parser(value, {precision}).value
        }}

        formatter={(value) => {
            // console.log({formatterValue: value})
            
            return parser(Number(value), {precision}).format()
        }}

        {...props}
    />
}