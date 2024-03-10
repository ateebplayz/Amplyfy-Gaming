import Product from './product'

export default interface Purchase {
    time: number,
    product: Product,
    value?: string,
}