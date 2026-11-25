package com.shoestore.inventory.product.application.service;

import com.shoestore.inventory.product.application.ports.in.CreateProductUseCase;
import com.shoestore.inventory.product.application.ports.in.GetProductsUseCase;
import com.shoestore.inventory.product.application.ports.in.UpdateStockUseCase;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.exception.ProductNotFoundException;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService implements GetProductsUseCase, CreateProductUseCase, UpdateStockUseCase {

	private final ProductRepositoryPort productRepositoryPort;

	public ProductService(ProductRepositoryPort productRepositoryPort) {
		this.productRepositoryPort = productRepositoryPort;
	}

	@Override
	public List<Product> getAllProducts() {
		return productRepositoryPort.findAll();
	}

	@Override
	public Product getProductById(Long id) {
		return productRepositoryPort.findById(id)
				.orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
	}

	@Override
	@Transactional
	public Product createProduct(Product product) {
		return productRepositoryPort.save(product);
	}

	@Override
	@Transactional
	public ProductVariant updateVariantStock(Long variantId, int delta) {
		productRepositoryPort.changeVariantStock(variantId, delta);
		return productRepositoryPort.findVariantById(variantId)
				.orElseThrow(() -> new ProductNotFoundException("Variant not found with id " + variantId));
	}
}
