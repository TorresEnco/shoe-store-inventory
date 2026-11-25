package com.shoestore.inventory.product.application.ports.out;

import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;

import java.util.List;
import java.util.Optional;

public interface ProductRepositoryPort {

	List<Product> findAll();

	Optional<Product> findById(Long id);

	Product save(Product product);

	Product saveCatalog(Product product);

	Optional<ProductVariant> findVariantById(Long variantId);

	void changeVariantStock(Long variantId, long delta);
}
