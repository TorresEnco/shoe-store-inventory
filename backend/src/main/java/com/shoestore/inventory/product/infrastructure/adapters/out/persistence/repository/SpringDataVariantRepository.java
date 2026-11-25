package com.shoestore.inventory.product.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductVariantJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SpringDataVariantRepository extends JpaRepository<ProductVariantJpaEntity, Long> {

	@Modifying
	@Query(value = """
			update product_variants
			set stock = coalesce(stock, 0) + :delta
			where id = :id and coalesce(stock, 0) + :delta between 0 and 2147483647
			""", nativeQuery = true)
	int changeStock(Long id, long delta);
}
