package com.shoestore.inventory.product.application.ports.in;

import com.shoestore.inventory.product.domain.model.Product;

import java.util.List;

public interface GetProductsUseCase {

	List<Product> getAllProducts();

	Product getProductById(Long id);
}
