import React from 'react';
import { Redirect } from 'react-router-dom';
import OrderType from '../../types/OrderType';
import api, { ApiResponse } from '../../api/api';
import { Container, Card, Table, Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import CartType from '../../types/CartType';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface OrdersPageState {
    isUserLoggedIn: boolean;
    orders: OrderType[];
    cartVisible: boolean;
    cart?: CartType;
}

interface OrderDto {
    orderId: number;
    createdAt: string;
    status: "rejected" | "accepted" | "shipped" | "pending";
    cart: {
        cartId: number;
        createdAt: string;
        cartCarpets: {
            quantity: number;
            carpet: {
                carpetId: number;
                name: string;
                excerpt: string;
                status: "XXL" | "XL" | "XXXL";
                isPromoted: number;
                category: {
                    categoryId: number;
                    name: string;
                },
                carpetPrices: {
                    createdAt: string;
                    price: number;
                }[];
                photos: {
                    imagePath: string;
                }[];
            };
        }[];
    };
}

export default class OrdersPage extends React.Component {
    state: OrdersPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            isUserLoggedIn: true,
            orders: [],
            cartVisible: false,
        }
    }

    private setLogginState(isLoggedIn: boolean) {
        this.setState(Object.assign(this.state, {
            isUserLoggedIn: isLoggedIn,
        }));
    }

    private setCartVisibleState(state: boolean) {
        this.setState(Object.assign(this.state, {
            cartVisible: state,
        }));
    }

    private setCartState(cart: CartType) {
        this.setState(Object.assign(this.state, {
            cart: cart,
        }));
    }

    private setOrdersState(orders: OrderType[]) {
        this.setState(Object.assign(this.state, {
            orders: orders,
        }));
    }

    private hideCart() {
        this.setCartVisibleState(false);
    }

    private showCart() {
        this.setCartVisibleState(true);
    }

    componentDidMount() {
        this.getOrders();
    }

    componentDidUpdate() {
        this.getOrders();
    }

    private getOrders() {
        api('/api/user/cart/orders/', 'get', {})
        .then((res: ApiResponse) => {
            const data: OrderDto[] = res.data;

            const orders: OrderType[] = data.map(order => ({
                orderId: order.orderId,
                status: order.status,
                createdAt: order.createdAt,
                cart: {
                    cartId: order.cart.cartId,
                    user: null,
                    userId: 0,
                    createdAt: order.cart.createdAt,
                    cartCarpets: order.cart.cartCarpets.map(ca => ({
                        cartCarpetId: 0,
                        carpetId: ca.carpet.carpetId,
                        quantity: ca.quantity,
                        carpet: {
                            carpetId: ca.carpet.carpetId,
                            name: ca.carpet.name,
                            category: {
                                categoryId: ca.carpet.category.categoryId,
                                name: ca.carpet.category.name,
                            },
                            carpetPrices: ca.carpet.carpetPrices.map(ap => ({
                                carpetPriceId: 0,
                                createdAt: ap.createdAt,
                                price: ap.price,
                            }))
                        }
                    }))
                }
            }));

            this.setOrdersState(orders);
        });
    }

    private getLatestPriceBeforeDate(carpet: any, latestDate: any) {
        const cartTimestamp = new Date(latestDate).getTime();

        let price = carpet.carpetPrices[0];

        for (let ap of carpet.carpetPrices) {
            const carpetPriceTimestamp = new Date(ap.createdAt).getTime();

            if (carpetPriceTimestamp < cartTimestamp) {
                price = ap;
            } else {
                break;
            }
        }

        return price;
    }

    private calculateSum(): number {
        let sum: number = 0;

        if (this.state.cart === undefined) {
            return sum;
        } else {
            for (const item of this.state.cart?.cartCarpets) {
                let price = this.getLatestPriceBeforeDate(item.carpet, this.state.cart.createdAt);
                sum += price.price * item.quantity;
            }
        }

        return sum;
    }

    render() {
        if (this.state.isUserLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }

        const sum = this.calculateSum();

        return (
            <Container>
                <RoledMainMenu role="user" />

                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={ faBox } /> My Orders
                        </Card.Title>

                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Created at</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.orders.map(this.printOrderRow, this) }
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal size="lg" centered show={ this.state.cartVisible } onHide={ () => this.hideCart() }>
                    <Modal.Header closeButton>
                        <Modal.Title>Your order content</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Carpet</th>
                                    
                                    <th className="text-right">Quantity</th>
                                    <th className="text-right">Price</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.cart?.cartCarpets.map(item => {
                                    const carpetPrice = this.getLatestPriceBeforeDate(item.carpet, this.state.cart?.createdAt);

                                    const price = Number(carpetPrice.price).toFixed(2);
                                    const total = Number(carpetPrice.price * item.quantity).toFixed(2);

                                    return (
                                        <tr>
                                            <td>{ item.carpet.category.name }</td>
                                            <td>{ item.carpet.name }</td>
                                            <td className="text-right">{ item.quantity }</td>
                                            <td className="text-right">{ price } EUR</td>
                                            <td className="text-right">{ total } EUR</td>
                                        </tr>
                                    )
                                }, this) }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="text-right">
                                        <strong>Total:</strong>
                                    </td>
                                    <td className="text-right">{ Number(sum).toFixed(2) } EUR</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Modal.Body>
                </Modal>
            </Container>
        );
    }

    private setAndShowCart(cart: CartType) {
        this.setCartState(cart);
        this.showCart();
    }

    private printOrderRow(order: OrderType) {
        return (
            <tr>
                <td>{ order.createdAt }</td>
                <td>{ order.status }</td>
                <td className="text-right">
                    <Button size="sm" variant="primary"
                            onClick={ () => this.setAndShowCart(order.cart) }>
                        <FontAwesomeIcon icon={ faBoxOpen } />
                    </Button>
                </td>
            </tr>
        );
    }
}
