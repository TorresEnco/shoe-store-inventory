package com.shoestore.inventory.product.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.exception.ProductNotFoundException;
import com.shoestore.inventory.product.domain.exception.InsufficientStockException;
import com.shoestore.inventory.product.domain.exception.InvalidCatalogException;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductVariantJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.mapper.ProductMapper;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.repository.SpringDataProductRepository;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.repository.SpringDataVariantRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

@Component
public class ProductPersistenceAdapter implements ProductRepositoryPort {

	private final SpringDataProductRepository productRepository;
	private final SpringDataVariantRepository variantRepository;
	private final ProductMapper mapper;
	private final EntityManager entityManager;

	public ProductPersistenceAdapter(SpringDataProductRepository productRepository,
			SpringDataVariantRepository variantRepository, ProductMapper mapper, EntityManager entityManager) {
		this.productRepository = productRepository;
		this.variantRepository = variantRepository;
		this.mapper = mapper;
		this.entityManager = entityManager;
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
	public Product saveCatalog(Product product) {
		if (product.getId() == null) return save(product);
		var target = entityManager.find(ProductJpaEntity.class, product.getId(), LockModeType.PESSIMISTIC_WRITE);
		if (target == null) throw new ProductNotFoundException("Producto inexistente.");
		var existing = target.getVariants().stream().collect(Collectors.toMap(
				ProductVariantJpaEntity::getId,
				variant -> variant));
		var submittedIds = product.getVariants().stream().map(ProductVariant::getId)
				.filter(Objects::nonNull).collect(Collectors.toSet());
		if (!submittedIds.equals(existing.keySet())) {
			throw new InvalidCatalogException(
					"Conserva las variantes registradas. Recarga el catálogo antes de editar.");
		}
		for (var variant : product.getVariants()) {
			var original = existing.get(variant.getId());
			if (original != null && (!original.getSize().equals(variant.getSize())
					|| !Objects.equals(original.getColor() == null ? "Sin color" : original.getColor().getName(), variant.getColor().getName()))) {
				throw new InvalidCatalogException(
						"Conserva el color y la talla de las variantes registradas.");
			}
		}
		var mapped = mapper.toEntity(product);
		target.setName(mapped.getName());
		target.setDescription(mapped.getDescription());
		target.setBrand(mapped.getBrand());
		target.setCategory(mapped.getCategory());
		target.setStatus(mapped.getStatus());
		for (var variant : mapped.getVariants()) {
			if (variant.getId() == null) target.addVariant(variant);
			else existing.get(variant.getId()).setCatalogPrice(variant.getCatalogPrice());
		}
		entityManager.flush();
		entityManager.refresh(target);
		return mapper.toDomain(target);
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
