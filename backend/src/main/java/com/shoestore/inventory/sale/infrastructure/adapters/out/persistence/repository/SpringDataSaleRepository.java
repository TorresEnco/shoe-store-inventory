package com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.entity.SaleJpaEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SpringDataSaleRepository extends JpaRepository<SaleJpaEntity, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select sale from SaleJpaEntity sale where sale.id = :id")
	Optional<SaleJpaEntity> findByIdForUpdate(Long id);

	List<SaleJpaEntity> findByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long userId, LocalDateTime start, LocalDateTime end);

	List<SaleJpaEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
