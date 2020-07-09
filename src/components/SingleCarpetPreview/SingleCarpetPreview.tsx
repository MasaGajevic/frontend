import React from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CarpetType from '../../types/CarpetType';
import { ApiConfig } from '../../config/api.config';
import api, { ApiResponse } from '../../api/api';

interface SingleCarpetPreviewProperties {
    carpet: CarpetType,
}

interface SingleCarpetPreviewState {
    quantity: number;
}

export default class SingleCarpetPreview extends React.Component<SingleCarpetPreviewProperties> {
    state: SingleCarpetPreviewState;

    constructor(props: Readonly<SingleCarpetPreviewProperties>) {
        super(props);

        this.state = {
            quantity: 1,
        }
    }

    private quantityChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            quantity: Number(event.target.value),
        });
    }

    private addToCart() {
        const data = {
            carpetId: this.props.carpet.carpetId,
            quantity: this.state.quantity,
        };

        api('/api/user/cart/addToCart/', 'post', data)
        .then((res: ApiResponse) => {
            if (res.status === 'error' || res.status === 'login') {
                return;
            }

            window.dispatchEvent(new CustomEvent('cart.update'));
        });
    }

    render() {
        return (
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="mb-3">
                    <Card.Header>
                        <img alt={ this.props.carpet.name }
                             src={ ApiConfig.PHOTO_PATH + 'small/' + this.props.carpet.imageUrl }
                             className="w-100"
                             />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="p">
                            <strong>{ this.props.carpet.name }</strong>
                        </Card.Title>
                        <Card.Text>
                            { this.props.carpet.excerpt }
                        </Card.Text>
                        <Card.Text>
                            Price: { Number(this.props.carpet.price).toFixed(2) } EUR
                        </Card.Text>
                        <Form.Group>
                            <Row>
                                <Col xs="7">
                                    <Form.Control type="number" min="1" step="1" value={ this.state.quantity }
                                                  onChange={ (e) => this.quantityChanged(e as any) } />
                                </Col>
                                <Col xs="5">
                                    <Button variant="secondary" block
                                            onClick={ () => this.addToCart() }>
                                        Buy
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>
                        <Link to={ `/carpet/${ this.props.carpet.carpetId }` }
                              className="btn btn-primary btn-block btn-sm">
                            Open carpet page
                        </Link>
                    </Card.Body>
                </Card>
            </Col>
        );
    }
}
