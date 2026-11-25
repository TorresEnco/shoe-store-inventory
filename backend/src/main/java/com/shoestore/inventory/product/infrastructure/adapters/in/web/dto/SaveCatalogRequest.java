package com.shoestore.inventory.product.infrastructure.adapters.in.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record SaveCatalogRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String description,
        @NotBlank @Size(max = 255) String brand,
        @NotBlank @Size(max = 255) String category,
        @NotNull Boolean status,
        @NotEmpty List<@NotNull @Valid Variant> variants) {
    public record Variant(
            @Positive Long id,
            @NotBlank @Size(max = 255) String color,
            @NotNull @Positive Integer size,
            @NotNull @Positive @Digits(integer = 36, fraction = 2) BigDecimal catalogPrice,
            @NotNull @PositiveOrZero Integer stock) {}
}
