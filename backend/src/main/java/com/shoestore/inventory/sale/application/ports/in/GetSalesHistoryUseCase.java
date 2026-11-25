package com.shoestore.inventory.sale.application.ports.in;

import com.shoestore.inventory.sale.domain.model.Sale;

import java.time.LocalDate;
import java.util.List;

public interface GetSalesHistoryUseCase {

	List<Sale> getTodaySales(Long ownerId);

	java.util.Optional<Sale> findVisibleSale(Long id, Long ownerId);

	List<Sale> getSalesByPeriod(LocalDate startDate, LocalDate endDate);
}
