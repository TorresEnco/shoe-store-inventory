package com.shoestore.inventory.sale.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.sale.application.ports.out.SaleRepositoryPort;
import com.shoestore.inventory.sale.domain.exception.SaleIdempotencyConflictException;
import com.shoestore.inventory.sale.domain.model.Sale;
import com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.entity.SaleJpaEntity;
import com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.mapper.SaleMapper;
import com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.repository.SpringDataSaleRepository;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class SalePersistenceAdapter implements SaleRepositoryPort {

	private final SpringDataSaleRepository saleRepository;
	private final SaleMapper mapper;
	private final JdbcTemplate jdbc;

	public SalePersistenceAdapter(SpringDataSaleRepository saleRepository, SaleMapper mapper, JdbcTemplate jdbc) {
		this.saleRepository = saleRepository;
		this.mapper = mapper;
		this.jdbc = jdbc;
	}

	@Override
	public Optional<Sale> claimRequest(Long actorId, UUID key, String hash) {
		int inserted = jdbc.update("""
				insert into sale_idempotency (actor_id, request_key, request_hash)
				values (?, ?, ?) on conflict (actor_id, request_key) do nothing
				""", actorId, key, hash);
		if (inserted == 1) {
			return Optional.empty();
		}
		var existing = jdbc.queryForObject("""
				select request_hash, sale_id from sale_idempotency where actor_id = ? and request_key = ?
				""", (rs, row) -> new RequestResult(rs.getString(1), rs.getObject(2, Long.class)), actorId, key);
		if (!hash.equals(existing.hash())) {
			throw new SaleIdempotencyConflictException();
		}
		return Optional.of(findById(existing.saleId()).orElseThrow());
	}

	@Override
	public void completeRequest(Long actorId, UUID key, Long saleId) {
		jdbc.update("update sale_idempotency set sale_id = ? where actor_id = ? and request_key = ?",
				saleId, actorId, key);
	}

	private record RequestResult(String hash, Long saleId) {}

	@Override
	public Sale save(Sale sale) {
		SaleJpaEntity saved = saleRepository.save(mapper.toEntity(sale));
		return mapper.toDomain(saved);
	}

	@Override
	public Optional<Sale> findById(Long id) {
		return saleRepository.findById(id).map(mapper::toDomain);
	}

	@Override
	public Optional<Sale> findByIdForUpdate(Long id) {
		return saleRepository.findByIdForUpdate(id).map(mapper::toDomain);
	}

	@Override
	public List<Sale> findByOwnerAndDateRange(Long ownerId, LocalDateTime start, LocalDateTime end) {
		return saleRepository.findByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(ownerId, start, end)
				.stream().map(mapper::toDomain).toList();
	}

	@Override
	public List<Sale> findByDateRange(LocalDateTime start, LocalDateTime end) {
		return saleRepository.findByCreatedAtBetween(start, end).stream()
				.map(mapper::toDomain)
				.toList();
	}
}
