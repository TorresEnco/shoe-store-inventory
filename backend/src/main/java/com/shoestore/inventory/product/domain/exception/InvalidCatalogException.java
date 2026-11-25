package com.shoestore.inventory.product.domain.exception;

public class InvalidCatalogException extends IllegalArgumentException {
    public InvalidCatalogException(String message) {
        super(message);
    }
}
