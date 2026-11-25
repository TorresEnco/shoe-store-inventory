package com.shoestore.inventory.product.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataProductRepository extends JpaRepository<ProductJpaEntity, Long> {
}
