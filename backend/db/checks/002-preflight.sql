BEGIN READ ONLY;

SELECT
    (SELECT count(*) FROM product_variants
        WHERE product_id IS NULL OR color_id IS NULL OR size IS NULL) AS incomplete_variants,
    (SELECT count(*) FROM product_variants
        WHERE stock IS NULL OR stock < 0) AS invalid_stock,
    (SELECT count(*) FROM (
        SELECT 1 FROM product_variants GROUP BY product_id, color_id, size HAVING count(*) > 1
    ) AS duplicates) AS duplicate_variant_groups,
    (SELECT count(*) FROM sales WHERE user_id IS NULL) AS legacy_sales_without_owner,
    (SELECT count(*) FROM sales s LEFT JOIN users u ON u.id = s.user_id
        WHERE s.user_id IS NOT NULL AND u.id IS NULL) AS sales_with_unknown_owner,
    (SELECT count(*) FROM sale_items i
        LEFT JOIN sales s ON s.id = i.sale_id
        LEFT JOIN product_variants v ON v.id = i.variant_id
        WHERE s.id IS NULL OR v.id IS NULL) AS items_without_sale_or_variant,
    (SELECT count(*) FROM sale_items
        WHERE unit_price IS NULL OR unit_price <= 0 OR unit_price = 'NaN'::numeric
            OR quantity IS NULL OR quantity <= 0 OR subtotal IS NULL
            OR subtotal <> unit_price * quantity) AS items_with_invalid_amounts;

COMMIT;
