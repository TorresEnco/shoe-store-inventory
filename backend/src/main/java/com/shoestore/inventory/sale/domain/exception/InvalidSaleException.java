package com.shoestore.inventory.sale.domain.exception;

public class InvalidSaleException extends IllegalArgumentException {
	public InvalidSaleException(String message) {
		super(message);
	}
}
