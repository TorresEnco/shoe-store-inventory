package com.shoestore.inventory.product.application.service;

import com.shoestore.inventory.product.application.ports.in.SaveCatalogUseCase;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.exception.InvalidCatalogException;
import com.shoestore.inventory.product.domain.model.Product;
import java.util.HashSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaveCatalogService implements SaveCatalogUseCase {
    private final ProductRepositoryPort products;

    public SaveCatalogService(ProductRepositoryPort products) {
        this.products = products;
    }

    @Override
    @Transactional
    public Product saveCatalog(Product product) {
        if (product.getName() == null || product.getName().isBlank() || product.getName().length() > 255
                || product.getBrand() == null || product.getBrand().getName() == null
                || product.getBrand().getName().isBlank() || product.getBrand().getName().length() > 255
                || product.getCategory() == null || product.getCategory().getDescription() == null
                || product.getCategory().getDescription().isBlank() || product.getCategory().getDescription().length() > 255
                || product.getDescription() != null && product.getDescription().length() > 255
                || product.getStatus() == null || product.getVariants() == null || product.getVariants().isEmpty()) {
            throw new InvalidCatalogException("Completa el modelo, marca, categoría y al menos una variante.");
        }
        var keys = new HashSet<String>();
        var ids = new HashSet<Long>();
        for (var variant : product.getVariants()) {
            if (variant == null || variant.getColor() == null || variant.getColor().getName() == null
                    || variant.getColor().getName().isBlank() || variant.getColor().getName().length() > 255
                    || variant.getSize() == null || variant.getSize() <= 0
                    || variant.getCatalogPrice() == null || variant.getCatalogPrice().signum() <= 0
                    || variant.getCatalogPrice().stripTrailingZeros().scale() > 2
                    || variant.getCatalogPrice().precision() - variant.getCatalogPrice().scale() > 36
                    || variant.getStock() == null || variant.getStock() < 0) {
                throw new InvalidCatalogException("Revisa color, talla, stock y precio positivo de hasta dos decimales.");
            }
            variant.getColor().setName(variant.getColor().getName().trim());
            if (!keys.add(variant.getColor().getName() + "::" + variant.getSize())
                    || variant.getId() != null && !ids.add(variant.getId())
                    || product.getId() == null && variant.getId() != null) {
                throw new InvalidCatalogException("Cada color y talla debe aparecer una sola vez.");
            }
        }
        product.setName(product.getName().trim());
        return products.saveCatalog(product);
    }
}
