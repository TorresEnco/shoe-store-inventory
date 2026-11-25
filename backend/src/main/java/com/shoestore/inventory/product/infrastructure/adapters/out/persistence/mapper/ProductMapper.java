package com.shoestore.inventory.product.infrastructure.adapters.out.persistence.mapper;

import com.shoestore.inventory.product.domain.model.Brand;
import com.shoestore.inventory.product.domain.model.Category;
import com.shoestore.inventory.product.domain.model.Color;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.BrandJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.CategoryJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ColorJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductJpaEntity;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductVariantJpaEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ProductMapper {

	private final EntityManager entityManager;

	public ProductMapper(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public Product toDomain(ProductJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		Product product = new Product();
		product.setId(entity.getId());
		product.setName(entity.getName());
		product.setDescription(entity.getDescription());
		product.setStatus(entity.getStatus());
		product.setCreatedAt(entity.getCreatedAt());
		product.setCategory(toCategoryDomain(entity.getCategory()));
		product.setBrand(toBrandDomain(entity.getBrand()));

		List<ProductVariant> variants = new ArrayList<>();
		for (ProductVariantJpaEntity variant : entity.getVariants()) {
			variants.add(toVariantDomain(variant, entity.getId()));
		}
		variants.sort(Comparator.comparing(ProductVariant::getSize));
		product.setVariants(variants);
		return product;
	}

	public ProductVariant toVariantDomain(ProductVariantJpaEntity entity, Long productId) {
		if (entity == null) {
			return null;
		}
		return new ProductVariant(
				entity.getId(),
				productId,
				toColorDomain(entity.getColor()),
				entity.getSize(),
				entity.getCatalogPrice(),
				entity.getStock(),
				entity.getCreatedAt());
	}

	public ProductJpaEntity toEntity(Product product) {
		if (product == null) {
			return null;
		}
		ProductJpaEntity entity = new ProductJpaEntity();
		entity.setId(product.getId());
		entity.setName(product.getName());
		entity.setDescription(product.getDescription());
		entity.setStatus(product.getStatus());
		entity.setCreatedAt(product.getCreatedAt());
		entity.setCategory(resolveCategory(product.getCategory()));
		entity.setBrand(resolveBrand(product.getBrand()));

		List<ProductVariantJpaEntity> variants = new ArrayList<>();
		if (product.getVariants() != null) {
			Map<String, ColorJpaEntity> resolvedColors = new HashMap<>();
			for (ProductVariant variant : product.getVariants()) {
				ProductVariantJpaEntity variantEntity = toVariantEntity(variant, resolvedColors);
				variantEntity.setProduct(entity);
				variants.add(variantEntity);
			}
		}
		entity.setVariants(variants);
		return entity;
	}

	public ProductVariantJpaEntity toVariantEntity(ProductVariant variant) {
		return toVariantEntity(variant, new HashMap<>());
	}

	private ProductVariantJpaEntity toVariantEntity(ProductVariant variant,
			Map<String, ColorJpaEntity> resolvedColors) {
		ProductVariantJpaEntity entity = new ProductVariantJpaEntity();
		entity.setId(variant.getId());
		entity.setSize(variant.getSize());
		entity.setCatalogPrice(variant.getCatalogPrice());
		entity.setStock(variant.getStock());
		entity.setCreatedAt(variant.getCreatedAt());
		entity.setColor(resolveColor(variant.getColor(), resolvedColors));
		return entity;
	}

	private Category toCategoryDomain(CategoryJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		return new Category(entity.getId(), entity.getDescription());
	}

	private Brand toBrandDomain(BrandJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		return new Brand(entity.getId(), entity.getName());
	}

	private Color toColorDomain(ColorJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		return new Color(entity.getId(), entity.getName());
	}

	private CategoryJpaEntity resolveCategory(Category category) {
		if (category == null) {
			return null;
		}
		if (category.getId() != null) {
			return entityManager.getReference(CategoryJpaEntity.class, category.getId());
		}
		CategoryJpaEntity entity = new CategoryJpaEntity(null, category.getDescription());
		var existing = entityManager.createQuery("select c from CategoryJpaEntity c where c.description = :name order by c.id", CategoryJpaEntity.class)
				.setParameter("name", category.getDescription()).setMaxResults(1).getResultList();
		if (!existing.isEmpty()) return existing.getFirst();
		entityManager.persist(entity);
		return entity;
	}

	private BrandJpaEntity resolveBrand(Brand brand) {
		if (brand == null) {
			return null;
		}
		if (brand.getId() != null) {
			return entityManager.getReference(BrandJpaEntity.class, brand.getId());
		}
		BrandJpaEntity entity = new BrandJpaEntity(null, brand.getName());
		var existing = entityManager.createQuery("select b from BrandJpaEntity b where b.name = :name order by b.id", BrandJpaEntity.class)
				.setParameter("name", brand.getName()).setMaxResults(1).getResultList();
		if (!existing.isEmpty()) return existing.getFirst();
		entityManager.persist(entity);
		return entity;
	}

	private ColorJpaEntity resolveColor(Color color, Map<String, ColorJpaEntity> resolvedColors) {
		if (color == null) {
			return null;
		}
		if (color.getId() != null) {
			return entityManager.getReference(ColorJpaEntity.class, color.getId());
		}
		String key = color.getName() == null ? "" : color.getName();
		return resolvedColors.computeIfAbsent(key, ignored -> {
			var existing = entityManager.createQuery("select c from ColorJpaEntity c where c.name = :name order by c.id", ColorJpaEntity.class)
					.setParameter("name", color.getName()).setMaxResults(1).getResultList();
			if (!existing.isEmpty()) return existing.getFirst();
			ColorJpaEntity entity = new ColorJpaEntity(null, color.getName());
			entityManager.persist(entity);
			return entity;
		});
	}
}
