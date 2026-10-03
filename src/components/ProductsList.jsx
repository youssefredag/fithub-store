import { ProductGrid } from '../pages/CommercePages';
import PropTypes from 'prop-types';

export default function ProductsList({ products }) {
  return <ProductGrid products={products} />;
}

ProductsList.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
};
