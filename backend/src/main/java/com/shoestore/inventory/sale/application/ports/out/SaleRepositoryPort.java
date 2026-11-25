package com.shoestore.inventory.sale.application.ports.out;

import com.shoestore.inventory.sale.domain.model.Sale;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaleRepositoryPort {

	Sale save(Sale sale);

	Optional<Sale> claimRequest(Long actorId, UUID key, String hash);

	void completeRequest(Long actorId, UUID key, Long saleId);

	Optional<Sale> findById(Long id);

	Optional<Sale> findByIdForUpdate(Long id);

	List<Sale> findByOwnerAndDateRange(Long ownerId, LocalDateTime start, LocalDateTime end);

	List<Sale> findByDateRange(LocalDateTime start, LocalDateTime end);
}
