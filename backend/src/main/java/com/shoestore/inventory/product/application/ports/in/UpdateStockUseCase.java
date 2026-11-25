package com.shoestore.inventory.product.application.ports.in;

import com.shoestore.inventory.product.domain.model.ProductVariant;

public interface UpdateStockUseCase {

	ProductVariant updateVariantStock(Long variantId, int delta);
}
