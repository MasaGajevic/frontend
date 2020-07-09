import React from 'react';
import { Container, Card, Col, Row, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import CategoryType from '../../types/CategoryType';
import api, { ApiResponse } from '../../api/api';
import CarpetType from '../../types/CarpetType';
import { Redirect, Link } from 'react-router-dom';
import SingleCarpetPreview from '../SingleCarpetPreview/SingleCarpetPreview';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import ApiCategoryDto from '../../dtos/ApiCategoryDto';

interface CategoryPageProperties {
    match: {
        params: {
            cId: number;
        }
    }
}

interface CategoryPageState {
    isUserLoggedIn: boolean;
    category?: CategoryType;
    subcategories?: CategoryType[];
    carpets?: CarpetType[];
    message: string;
    filters: {
        keywords: string;
        priceMininum: number;
        priceMaximum: number;
        order: "name asc" | "name desc" | "price asc" | "price desc";
    };
}

interface CarpetDto {
    carpetId: number;
    name: string;
    excerpt?: string;
    description?: string;
    carpetPrices?: {
        price: number;
        createdAt: string;
    }[],
    photos?: {
        imagePath: string;
    }[],
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);

        this.state = {
            isUserLoggedIn: true,
            message: '',
            filters: {
                keywords: '',
                priceMininum: 0.01,
                priceMaximum: 100000,
                order: "price asc"
            },
        };
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isUserLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setMessage(message: string) {
        const newState = Object.assign(this.state, {
            message: message,
        });

        this.setState(newState);
    }

    private setCategoryData(category: CategoryType) {
        this.setState(Object.assign(this.state, {
            category: category,
        }));
    }

    private setSubcategories(subcategories: CategoryType[]) {
        this.setState(Object.assign(this.state, {
            subcategories: subcategories,
        }));
    }

    private setCarpets(carpets: CarpetType[]) {
        this.setState(Object.assign(this.state, {
            carpets: carpets,
        }));
    }

    render() {
        if (this.state.isUserLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }

        return (
            <Container>
                <RoledMainMenu role="user" />

                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={ faListAlt } /> { this.state.category?.name }
                        </Card.Title>

                        { this.printOptionalMessage() }

                        { this.showSubcategories() }

                        <Row>
                            <Col xs="12" md="4" lg="3">
                                { this.printFilters() }
                            </Col>

                            <Col xs="12" md="8" lg="9">
                                { this.showCarpets() }
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    private setNewFilter(newFilter: any) {
        this.setState(Object.assign(this.state, {
            filter: newFilter,
        }));
    }

    private filterKeywordsChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            keywords: event.target.value,
        }));
    }

    private filterPriceMinChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            priceMininum: Number(event.target.value),
        }));
    }

    private filterPriceMaxChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            priceMaximum: Number(event.target.value),
        }));
    }

    private filterOrderChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            order: event.target.value,
        }));
    }


    private applyFilters() {
        this.getCategoryData();
    }

    private printFilters() {
        return (
            <>
                <Form.Group>
                    <Form.Label htmlFor="keywords">Search keywords:</Form.Label>
                    <Form.Control type="text" id="keywords"
                                  value={ this.state.filters.keywords }
                                  onChange={ (e) => this.filterKeywordsChanged(e as any) } />
                </Form.Group>

                <Form.Group>
                    <Row>
                        <Col xs="12" sm="6">
                            <Form.Label htmlFor="priceMin">Min. price:</Form.Label>
                            <Form.Control type="number" id="priceMin"
                                          step="0.01" min="0.01" max="99999.99"
                                          value={ this.state.filters.priceMininum }
                                          onChange={ (e) => this.filterPriceMinChanged(e as any) } />
                        </Col>
                        <Col xs="12" sm="6">
                        <Form.Label htmlFor="priceMax">Max. price:</Form.Label>
                            <Form.Control type="number" id="priceMax"
                                          step="0.01" min="0.02" max="100000"
                                          value={ this.state.filters.priceMaximum }
                                          onChange={ (e) => this.filterPriceMaxChanged(e as any) } />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group>
                    <Form.Control as="select" id="sortOrder"
                                  value={ this.state.filters.order }
                                  onChange={ (e) => this.filterOrderChanged(e as any) }>
                        <option value="name asc">Sort by name - ascending</option>
                        <option value="name desc">Sort by name - descending</option>
                        <option value="price asc">Sort by price - ascending</option>
                        <option value="price desc">Sort by price - descending</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group>
                    <Button variant="primary" block onClick={ () => this.applyFilters() }>
                        <FontAwesomeIcon icon={ faSearch } /> Search
                    </Button>
                </Form.Group>
            </>
        );
    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }

        return (
            <Card.Text>
                { this.state.message }
            </Card.Text>
        );
    }

    private showSubcategories() {
        if (this.state.subcategories?.length === 0) {
            return;
        }

        return (
            <Row>
                { this.state.subcategories?.map(this.singleCategory) }
            </Row>
        );
    }

    private singleCategory(category: CategoryType) {
        return (
            <Col lg="3" md="4" sm="6" xs="12">
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title as="p">
                            { category.name }
                        </Card.Title>
                        <Link to={ `/category/${ category.categoryId }` }
                              className="btn btn-primary btn-block btn-sm">
                            Open category
                        </Link>
                    </Card.Body>
                </Card>
            </Col>
        );
    }

    private showCarpets() {
        if (this.state.carpets?.length === 0) {
            return (
                <div>There are no carpets in this category.</div>
            );
        }

        return (
            <Row>
                { this.state.carpets?.map(this.singleCarpet) }
            </Row>
        );
    }

    private singleCarpet(carpet: CarpetType) {
        return (
            <SingleCarpetPreview carpet={carpet} />
        );
    }

    componentDidMount() {
        this.getCategoryData();
    }

    componentDidUpdate(oldProperties: CategoryPageProperties) {
        if (oldProperties.match.params.cId === this.props.match.params.cId) {
            return;
        }

        this.getCategoryData();
    }

    private getCategoryData() {
        api('api/category/' + this.props.match.params.cId, 'get', {})
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }

            if (res.status === 'error') {
                return this.setMessage('Request error. Please try to refresh the page.');
            }

            const categoryData: CategoryType = {
                categoryId: res.data.categoryId,
                name: res.data.name,
            };

            this.setCategoryData(categoryData);

            const subcategories: CategoryType[] =
            res.data.categories.map((category: ApiCategoryDto) => {
                return {
                    categoryId: category.categoryId,
                    name: category.name,
                }
            });

            this.setSubcategories(subcategories);
        });

        const orderParts = this.state.filters.order.split(' ');
        const orderBy = orderParts[0];
        const orderDirection = orderParts[1].toUpperCase();

        api('api/carpet/search/', 'post', {
            categoryId: Number(this.props.match.params.cId),
            keywords: this.state.filters.keywords,
            priceMin: this.state.filters.priceMininum,
            priceMax: this.state.filters.priceMaximum,
            orderBy: orderBy,
            orderDirection: orderDirection,
        })
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                return this.setLogginState(false);
            }

            if (res.status === 'error') {
                return this.setMessage('Request error. Please try to refresh the page.');
            }

            if (res.data.statusCode === 0) {
                this.setMessage('');
                this.setCarpets([]);
                return;
            }

            const carpets: CarpetType[] =
            res.data.map((carpet: CarpetDto) => {
                const object: CarpetType = {
                    carpetId: carpet.carpetId,
                    name: carpet.name,
                    excerpt: carpet.excerpt,
                    description: carpet.description,
                    imageUrl: '',
                    price: 0,
                };

                if (carpet.photos !== undefined && carpet.photos?.length > 0) {
                    object.imageUrl = carpet.photos[carpet.photos?.length-1].imagePath;
                }

                if (carpet.carpetPrices !== undefined && carpet.carpetPrices?.length > 0) {
                    object.price = carpet.carpetPrices[carpet.carpetPrices?.length-1].price;
                }

                return object;
            });

            this.setCarpets(carpets);
        });
    }
}
