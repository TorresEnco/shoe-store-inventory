package com.shoestore.inventory.sale.application.service;

import com.shoestore.inventory.customer.application.ports.out.CustomerRepositoryPort;
import com.shoestore.inventory.customer.domain.model.Customer;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.sale.domain.exception.SaleAlreadyCancelledException;
import com.shoestore.inventory.sale.domain.exception.InvalidSaleException;
import com.shoestore.inventory.sale.application.ports.in.CancelSaleUseCase;
import com.shoestore.inventory.sale.application.ports.in.GetSalesHistoryUseCase;
import com.shoestore.inventory.sale.application.ports.in.ProcessSaleUseCase;
import com.shoestore.inventory.sale.application.ports.out.SaleRepositoryPort;
import com.shoestore.inventory.sale.domain.model.Sale;
import com.shoestore.inventory.sale.domain.model.SaleItem;
import com.shoestore.inventory.sale.domain.model.SaleStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SaleService implements ProcessSaleUseCase, CancelSaleUseCase, GetSalesHistoryUseCase {

	private final SaleRepositoryPort saleRepositoryPort;
	private final ProductRepositoryPort productRepositoryPort;
	private final CustomerRepositoryPort customerRepositoryPort;

	public SaleService(SaleRepositoryPort saleRepositoryPort, ProductRepositoryPort productRepositoryPort,
			CustomerRepositoryPort customerRepositoryPort) {
		this.saleRepositoryPort = saleRepositoryPort;
		this.productRepositoryPort = productRepositoryPort;
		this.customerRepositoryPort = customerRepositoryPort;
	}

	@Override
	@Transactional
	public Sale processSale(Sale sale, UUID requestKey, String requestHash) {
		var existing = saleRepositoryPort.claimRequest(sale.getUserId(), requestKey, requestHash);
		if (existing.isPresent()) {
			return existing.get();
		}
		Sale created = processSale(sale);
		saleRepositoryPort.completeRequest(sale.getUserId(), requestKey, created.getId());
		return created;
	}

	@Override
	@Transactional
	public Sale processSale(Sale sale) {
		sale.recalculateAmounts();
		if (sale.getCustomerName() == null || sale.getCustomerName().isBlank()) {
			sale.setCustomerName("Público General");
		}

		for (SaleItem item : sale.getItems()) {
			var variant = productRepositoryPort.findVariantById(item.getVariantId())
					.orElseThrow(() -> new InvalidSaleException("La variante seleccionada ya no existe."));
			var product = productRepositoryPort.findById(variant.getProductId())
					.orElseThrow(() -> new InvalidSaleException("El producto seleccionado ya no existe."));
			if (Boolean.FALSE.equals(product.getStatus())) {
				throw new InvalidSaleException("El producto seleccionado está inactivo.");
			}
		}
		attachCustomer(sale);

		changeStock(sale, -1);

		sale.setStatus(SaleStatus.COMPLETED);
		return saleRepositoryPort.save(sale);
	}

	@Override
	@Transactional
	public Sale cancelSale(Long saleId) {
		Sale sale = saleRepositoryPort.findByIdForUpdate(saleId)
				.orElseThrow(() -> new IllegalArgumentException("Sale not found with id " + saleId));
		if (sale.getStatus() == SaleStatus.CANCELLED) {
			throw new SaleAlreadyCancelledException();
		}

		changeStock(sale, 1);

		sale.setStatus(SaleStatus.CANCELLED);
		return saleRepositoryPort.save(sale);
	}

	private void changeStock(Sale sale, int direction) {
		sale.getItems().stream()
				.sorted(Comparator.comparing(SaleItem::getVariantId))
				.forEach(item -> productRepositoryPort.changeVariantStock(
						item.getVariantId(), (long) direction * item.getQuantity()));
	}

	@Override
	public List<Sale> getTodaySales(Long ownerId) {
		LocalDate today = LocalDate.now();
		if (ownerId != null) {
			return saleRepositoryPort.findByOwnerAndDateRange(ownerId, today.atStartOfDay(), today.plusDays(1).atStartOfDay());
		}
		return saleRepositoryPort.findByDateRange(today.atStartOfDay(), today.plusDays(1).atStartOfDay());
	}

	@Override
	public java.util.Optional<Sale> findVisibleSale(Long id, Long ownerId) {
		return saleRepositoryPort.findById(id).filter(sale -> ownerId == null || ownerId.equals(sale.getUserId()));
	}

	private void attachCustomer(Sale sale) {
		String rawName = sale.getCustomerName();
		String rawPhone = sale.getCustomerPhone();
		boolean typedPhone = rawName != null && rawName.trim().matches("\\d{6,}");
		boolean hasName = rawName != null && !rawName.isBlank()
				&& !"Público General".equalsIgnoreCase(rawName.trim()) && !typedPhone;
		boolean hasPhone = rawPhone != null && !rawPhone.isBlank();

		if (!hasName && !hasPhone) {
			return;
		}

		String phone = hasPhone ? rawPhone.trim() : (typedPhone ? rawName.trim() : null);
		String name = hasName ? rawName.trim() : "Cliente";
		String query = phone != null ? phone : name;

		Customer customer = customerRepositoryPort.findByNameOrPhone(query).stream()
				.filter(candidate -> (candidate.getPhone() != null && candidate.getPhone().equals(query))
						|| (candidate.getName() != null && candidate.getName().equalsIgnoreCase(query)))
				.findFirst()
				.orElseGet(() -> {
					Customer created = new Customer();
					created.setName(name);
					created.setPhone(phone);
					created.setTotalPurchases(0);
					return created;
				});

		int pairs = sale.getItems().stream()
				.mapToInt(item -> item.getQuantity() == null ? 0 : item.getQuantity())
				.sum();
		customer.setTotalPurchases((customer.getTotalPurchases() == null ? 0 : customer.getTotalPurchases()) + pairs);

		Customer saved = customerRepositoryPort.save(customer);
		sale.setCustomerId(saved.getId());
		sale.setCustomerName(saved.getName());
	}

	@Override
	public List<Sale> getSalesByPeriod(LocalDate startDate, LocalDate endDate) {
		LocalDateTime start = startDate.atStartOfDay();
		LocalDateTime end = endDate.plusDays(1).atStartOfDay();
		return saleRepositoryPort.findByDateRange(start, end);
	}
}
