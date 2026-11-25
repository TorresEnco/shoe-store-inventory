package com.shoestore.inventory.product.infrastructure.adapters.in.web;

import com.shoestore.inventory.product.application.ports.in.CreateProductUseCase;
import com.shoestore.inventory.product.application.ports.in.GetProductsUseCase;
import com.shoestore.inventory.product.application.ports.in.UpdateStockUseCase;
import com.shoestore.inventory.product.domain.model.Brand;
import com.shoestore.inventory.product.domain.model.Category;
import com.shoestore.inventory.product.domain.model.Color;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.dto.CreateProductRequest;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.dto.ProductResponse;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.dto.UpdateStockRequest;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.dto.VariantResponse;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

	private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProductController.class);

	private final GetProductsUseCase getProductsUseCase;
	private final CreateProductUseCase createProductUseCase;
	private final UpdateStockUseCase updateStockUseCase;

	public ProductController(GetProductsUseCase getProductsUseCase,
			CreateProductUseCase createProductUseCase, UpdateStockUseCase updateStockUseCase) {
		this.getProductsUseCase = getProductsUseCase;
		this.createProductUseCase = createProductUseCase;
		this.updateStockUseCase = updateStockUseCase;
	}

	@GetMapping
	public List<ProductResponse> getAllProducts() {
		return getProductsUseCase.getAllProducts().stream()
				.map(ProductResponse::from)
				.toList();
	}

	@GetMapping("/{id}")
	public ProductResponse getProductById(@PathVariable Long id) {
		return ProductResponse.from(getProductsUseCase.getProductById(id));
	}

	@PostMapping
	public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
		Product created = createProductUseCase.createProduct(toDomain(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(created));
	}

	@PatchMapping("/variants/{variantId}/stock")
	public VariantResponse updateStock(@PathVariable Long variantId, @Valid @RequestBody UpdateStockRequest request,
			@AuthenticationPrincipal LoginResponse actor) {
		ProductVariant updated = updateStockUseCase.updateVariantStock(variantId, request.delta());
		log.info("Manual stock adjustment employee={} variant={} previous={} updated={}",
				actor.id(), variantId, (long) updated.getStock() - request.delta(), updated.getStock());
		return VariantResponse.from(updated);
	}

	private Product toDomain(CreateProductRequest request) {
		Product product = new Product();
		product.setName(request.name());
		product.setDescription(request.description());
		product.setCategory(new Category(request.categoryId(), null));
		product.setBrand(new Brand(request.brandId(), null));
		product.setStatus(request.status() != null ? request.status() : Boolean.TRUE);

		List<ProductVariant> variants = new ArrayList<>();
		if (request.variants() != null) {
			for (CreateProductRequest.VariantRequest variant : request.variants()) {
				variants.add(new ProductVariant(
						null,
						null,
						new Color(variant.colorId(), null),
						variant.size(),
						variant.catalogPrice(),
						variant.stock() != null ? variant.stock() : 0,
						null));
			}
		}
		product.setVariants(variants);
		return product;
	}
}
