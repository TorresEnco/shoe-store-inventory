package com.shoestore.inventory.product.application.ports.in;

import com.shoestore.inventory.product.domain.model.Product;

public interface CreateProductUseCase {

	Product createProduct(Product product);
}
