package com.shoestore.inventory.product.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.exception.ProductNotFoundException;
import com.shoestore.inventory.product.domain.exception.InsufficientStockException;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.mapper.ProductMapper;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.repository.SpringDataProductRepository;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.repository.SpringDataVariantRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ProductPersistenceAdapter implements ProductRepositoryPort {

	private final SpringDataProductRepository productRepository;
	private final SpringDataVariantRepository variantRepository;
	private final ProductMapper mapper;

	public ProductPersistenceAdapter(SpringDataProductRepository productRepository,
			SpringDataVariantRepository variantRepository, ProductMapper mapper) {
		this.productRepository = productRepository;
		this.variantRepository = variantRepository;
		this.mapper = mapper;
	}

	@Override
	public List<Product> findAll() {
		return productRepository.findAll().stream()
				.map(mapper::toDomain)
				.toList();
	}

	@Override
	public Optional<Product> findById(Long id) {
		return productRepository.findById(id).map(mapper::toDomain);
	}

	@Override
	public Product save(Product product) {
		ProductJpaEntity saved = productRepository.save(mapper.toEntity(product));
		return mapper.toDomain(saved);
	}

	@Override
	public Optional<ProductVariant> findVariantById(Long variantId) {
		return variantRepository.findById(variantId)
				.map(entity -> mapper.toVariantDomain(entity, entity.getProduct().getId()));
	}

	@Override
	public void changeVariantStock(Long variantId, long delta) {
		if (variantRepository.changeStock(variantId, delta) == 0) {
			if (!variantRepository.existsById(variantId)) {
				throw new ProductNotFoundException("Variant not found with id " + variantId);
			}
			throw new InsufficientStockException("El cambio deja el stock fuera del rango permitido.");
		}
	}
}
