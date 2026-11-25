package com.shoestore.inventory.sale.domain.exception;

public class SaleAlreadyCancelledException extends IllegalStateException {
	public SaleAlreadyCancelledException() {
		super("La venta ya está anulada.");
	}
}
