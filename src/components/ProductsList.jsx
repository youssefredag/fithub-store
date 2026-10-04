import { ProductGrid } from '../pages/CommercePages';
import PropTypes from 'prop-types';

export default function ProductsList({ products, loading }) {
  return <ProductGrid products={products} loading={loading} />;
}

ProductsList.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
};
