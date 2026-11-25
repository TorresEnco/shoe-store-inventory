BEGIN;

ALTER TABLE product_variants
    ALTER COLUMN product_id SET NOT NULL,
    ALTER COLUMN color_id SET NOT NULL,
    ALTER COLUMN size SET NOT NULL,
    ALTER COLUMN stock SET NOT NULL,
    ADD CONSTRAINT product_variants_stock_nonnegative CHECK (stock >= 0),
    ADD CONSTRAINT product_variants_product_color_size_unique UNIQUE (product_id, color_id, size);

ALTER TABLE sales
    ADD CONSTRAINT sales_user_fk FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE sale_items
    ALTER COLUMN sale_id SET NOT NULL,
    ALTER COLUMN variant_id SET NOT NULL,
    ALTER COLUMN unit_price SET NOT NULL,
    ALTER COLUMN quantity SET NOT NULL,
    ALTER COLUMN subtotal SET NOT NULL,
    ADD CONSTRAINT sale_items_variant_fk FOREIGN KEY (variant_id) REFERENCES product_variants (id),
    ADD CONSTRAINT sale_items_price_positive CHECK (unit_price > 0 AND unit_price <> 'NaN'::numeric),
    ADD CONSTRAINT sale_items_quantity_positive CHECK (quantity > 0),
    ADD CONSTRAINT sale_items_subtotal_matches CHECK (subtotal = unit_price * quantity);

CREATE FUNCTION require_sale_owner() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    -- A historical sale can still be cancelled with its original null owner.
    IF NEW.user_id IS NULL AND (TG_OP = 'INSERT' OR OLD.user_id IS NOT NULL) THEN
        RAISE EXCEPTION 'A new sale requires an employee and an assigned employee cannot be cleared.'
            USING ERRCODE = '23502', COLUMN = 'user_id';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER sales_require_owner
    BEFORE INSERT OR UPDATE OF user_id ON sales
    FOR EACH ROW EXECUTE FUNCTION require_sale_owner();

COMMIT;
