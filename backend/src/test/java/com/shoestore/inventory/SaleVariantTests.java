package com.shoestore.inventory;

import com.shoestore.inventory.customer.application.ports.out.CustomerRepositoryPort;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.sale.application.ports.out.SaleRepositoryPort;
import com.shoestore.inventory.sale.application.service.SaleService;
import com.shoestore.inventory.sale.domain.exception.InvalidSaleException;
import com.shoestore.inventory.sale.domain.model.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SaleVariantTests {
    private final ProductRepositoryPort products = mock(ProductRepositoryPort.class);
    private final SaleRepositoryPort sales = mock(SaleRepositoryPort.class);
    private final CustomerRepositoryPort customers = mock(CustomerRepositoryPort.class);
    private final SaleService service = new SaleService(sales, products, customers);

    private Sale sale(boolean active) {
        Product product = new Product();
        product.setStatus(active);
        for (long id : new long[]{17, 18}) {
            ProductVariant variant = new ProductVariant();
            variant.setProductId(1L);
            when(products.findVariantById(id)).thenReturn(Optional.of(variant));
        }
        when(products.findById(1L)).thenReturn(Optional.of(product));
        Sale sale = new Sale();
        sale.setPaymentType(PaymentType.CASH);
        sale.setItems(List.of(new SaleItem(null, 17L, new BigDecimal("45"), 1, null),
                new SaleItem(null, 18L, new BigDecimal("60"), 1, null)));
        return sale;
    }

    @Test
    void inactiveProductIsRejectedBeforeWrites() {
        Sale sale = sale(false);
        assertThrows(InvalidSaleException.class, () -> service.processSale(sale));
        verify(products, never()).changeVariantStock(anyLong(), anyLong());
        verifyNoInteractions(sales, customers);
    }

    @Test
    void distinctVariantsKeepNegotiatedPricesAndStockMovements() {
        Sale sale = sale(true);
        when(sales.save(sale)).thenReturn(sale);
        service.processSale(sale);
        assertEquals(new BigDecimal("105.00"), sale.getTotal());
        assertEquals(new BigDecimal("45.00"), sale.getItems().get(0).getUnitPrice());
        assertEquals(new BigDecimal("60.00"), sale.getItems().get(1).getUnitPrice());
        verify(products).changeVariantStock(17L, -1L);
        verify(products).changeVariantStock(18L, -1L);
        verify(sales).save(sale);
    }
}
