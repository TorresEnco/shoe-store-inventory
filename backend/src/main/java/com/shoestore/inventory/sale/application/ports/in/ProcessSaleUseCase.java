package com.shoestore.inventory.sale.application.ports.in;

import com.shoestore.inventory.sale.domain.model.Sale;
import java.util.UUID;

public interface ProcessSaleUseCase {

	Sale processSale(Sale sale);

	Sale processSale(Sale sale, UUID requestKey, String requestHash);
}
