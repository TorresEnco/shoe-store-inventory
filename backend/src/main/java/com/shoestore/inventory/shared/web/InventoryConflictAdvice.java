package com.shoestore.inventory.shared.web;

import com.shoestore.inventory.product.domain.exception.InsufficientStockException;
import com.shoestore.inventory.product.domain.exception.ProductNotFoundException;
import com.shoestore.inventory.sale.domain.exception.SaleAlreadyCancelledException;
import com.shoestore.inventory.sale.domain.exception.InvalidSaleException;
import com.shoestore.inventory.sale.domain.exception.SaleIdempotencyConflictException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class InventoryConflictAdvice {
    @ExceptionHandler(com.shoestore.inventory.product.domain.exception.InvalidCatalogException.class)
    ProblemDetail invalidCatalog(com.shoestore.inventory.product.domain.exception.InvalidCatalogException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }
	@ExceptionHandler(InvalidSaleException.class)
	ProblemDetail invalidSale(InvalidSaleException exception) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
	}

	@ExceptionHandler(SaleIdempotencyConflictException.class)
	ProblemDetail idempotencyConflict() {
		return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
				"La clave ya pertenece a un cobro distinto. Consulta el historial.");
	}

	@ExceptionHandler(InsufficientStockException.class)
	ProblemDetail stockConflict() {
		var problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
				"El stock disponible no permite completar la operación. Actualiza el catálogo.");
		problem.setProperty("code", "stock_conflict");
		return problem;
	}

	@ExceptionHandler(SaleAlreadyCancelledException.class)
	ProblemDetail cancellationConflict() {
		return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "La venta ya está anulada.");
	}

	@ExceptionHandler(ProductNotFoundException.class)
	ProblemDetail productNotFound() {
		return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "El producto o la variante no existe.");
	}
}
