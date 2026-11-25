package com.shoestore.inventory.sale.application.ports.in;

import com.shoestore.inventory.sale.domain.model.Sale;

public interface CancelSaleUseCase {

	Sale cancelSale(Long saleId);
}
