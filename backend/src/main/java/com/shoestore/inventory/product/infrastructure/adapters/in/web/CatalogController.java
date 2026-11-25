package com.shoestore.inventory.product.infrastructure.adapters.in.web;

import com.shoestore.inventory.product.application.ports.in.SaveCatalogUseCase;
import com.shoestore.inventory.product.domain.model.*;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.dto.SaveCatalogRequest;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.dto.ProductResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class CatalogController {
    private final SaveCatalogUseCase catalog;

    public CatalogController(SaveCatalogUseCase catalog) {
        this.catalog = catalog;
    }

    @PostMapping("/catalog")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody SaveCatalogRequest request) {
        return ProductResponse.from(catalog.saveCatalog(toDomain(null, request)));
    }

    @PutMapping("/{id}/catalog")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody SaveCatalogRequest request) {
        return ProductResponse.from(catalog.saveCatalog(toDomain(id, request)));
    }

    private Product toDomain(Long id, SaveCatalogRequest request) {
        Product product = new Product();
        product.setId(id);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setBrand(new Brand(null, request.brand().trim()));
        product.setCategory(new Category(null, request.category().trim()));
        product.setStatus(request.status());
        product.setVariants(request.variants().stream().map(variant -> new ProductVariant(
                variant.id(), id, new Color(null, variant.color()), variant.size(),
                variant.catalogPrice(), variant.stock(), null)).toList());
        return product;
    }
}
