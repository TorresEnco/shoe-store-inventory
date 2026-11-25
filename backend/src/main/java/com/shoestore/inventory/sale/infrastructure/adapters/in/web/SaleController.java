package com.shoestore.inventory.sale.infrastructure.adapters.in.web;

import com.shoestore.inventory.sale.application.ports.in.CancelSaleUseCase;
import com.shoestore.inventory.sale.application.ports.in.GetSalesHistoryUseCase;
import com.shoestore.inventory.sale.application.ports.in.ProcessSaleUseCase;
import com.shoestore.inventory.sale.domain.model.Sale;
import com.shoestore.inventory.sale.domain.model.SaleItem;
import com.shoestore.inventory.sale.infrastructure.adapters.in.web.dto.ProcessSaleRequest;
import com.shoestore.inventory.sale.infrastructure.adapters.in.web.dto.SaleItemRequest;
import com.shoestore.inventory.sale.infrastructure.adapters.in.web.dto.SaleResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import tools.jackson.databind.json.JsonMapper;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173")
public class SaleController {
	private static final JsonMapper JSON = new JsonMapper();

	private final ProcessSaleUseCase processSaleUseCase;
	private final CancelSaleUseCase cancelSaleUseCase;
	private final GetSalesHistoryUseCase getSalesHistoryUseCase;

	public SaleController(ProcessSaleUseCase processSaleUseCase, CancelSaleUseCase cancelSaleUseCase,
			GetSalesHistoryUseCase getSalesHistoryUseCase) {
		this.processSaleUseCase = processSaleUseCase;
		this.cancelSaleUseCase = cancelSaleUseCase;
		this.getSalesHistoryUseCase = getSalesHistoryUseCase;
	}

	@PostMapping
	public ResponseEntity<SaleResponse> processSale(@Valid @RequestBody ProcessSaleRequest request,
			@RequestHeader("Idempotency-Key") UUID key, @AuthenticationPrincipal LoginResponse actor) {
		Sale created = processSaleUseCase.processSale(toDomain(request, actor.id()), key, fingerprint(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(SaleResponse.from(created));
	}

	private static String fingerprint(ProcessSaleRequest request) {
		var items = request.items().stream()
				.map(item -> List.of(item.variantId(), item.quantity(), item.unitPrice().stripTrailingZeros().toString()))
				.toList();
		var fields = List.of(Objects.toString(request.customerName(), ""),
				Objects.toString(request.customerPhone(), ""), request.paymentType().name(), items);
		try {
			byte[] hash = MessageDigest.getInstance("SHA-256").digest(JSON.writeValueAsBytes(fields));
			return HexFormat.of().formatHex(hash);
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException(ex);
		}
	}

	@GetMapping("/today")
	public List<SaleResponse> getTodaySales(@AuthenticationPrincipal LoginResponse actor) {
		return getSalesHistoryUseCase.getTodaySales(ownerScope(actor)).stream()
				.map(SaleResponse::from)
				.toList();
	}

	private Long ownerScope(LoginResponse actor) {
		return actor.role() == com.shoestore.inventory.user.domain.model.Role.ADMIN ? null : actor.id();
	}

	@GetMapping("/{id:[0-9]+}")
	public ResponseEntity<SaleResponse> getSale(@PathVariable Long id, @AuthenticationPrincipal LoginResponse actor) {
		return ResponseEntity.of(getSalesHistoryUseCase.findVisibleSale(id, ownerScope(actor)).map(SaleResponse::from));
	}

	@PatchMapping("/{id}/cancel")
	public SaleResponse cancelSale(@PathVariable Long id) {
		return SaleResponse.from(cancelSaleUseCase.cancelSale(id));
	}

	private Sale toDomain(ProcessSaleRequest request, Long actorId) {
		Sale sale = new Sale();
		sale.setUserId(actorId);
		sale.setCustomerName(request.customerName());
		sale.setCustomerPhone(request.customerPhone());
		sale.setPaymentType(request.paymentType());

		List<SaleItem> items = new ArrayList<>();
		for (SaleItemRequest itemRequest : request.items()) {
			items.add(new SaleItem(null, itemRequest.variantId(), itemRequest.unitPrice(),
					itemRequest.quantity(), null));
		}
		sale.setItems(items);
		return sale;
	}
}
