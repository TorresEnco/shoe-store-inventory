package com.shoestore.inventory;

import com.shoestore.inventory.product.application.ports.in.UpdateStockUseCase;
import com.shoestore.inventory.product.domain.exception.InsufficientStockException;
import com.shoestore.inventory.sale.application.ports.in.CancelSaleUseCase;
import com.shoestore.inventory.sale.application.ports.in.GetSalesHistoryUseCase;
import com.shoestore.inventory.sale.application.ports.in.ProcessSaleUseCase;
import com.shoestore.inventory.sale.domain.exception.SaleAlreadyCancelledException;
import com.shoestore.inventory.sale.domain.exception.InvalidSaleException;
import com.shoestore.inventory.sale.domain.model.PaymentType;
import com.shoestore.inventory.sale.domain.model.Sale;
import com.shoestore.inventory.sale.domain.model.SaleItem;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.SpringApplication;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIfEnvironmentVariable(named = "TX01_TEST_JDBC_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/postgres")
class StockConcurrencyTests {
	@Test
	void protectsLastUnitAndRestoresStockOnlyOnce() throws Exception {
		String url = System.getenv("TX01_TEST_JDBC_URL");
		try (var connection = DriverManager.getConnection(url, "tx01_fixture", "fixture-only");
			 var statement = connection.createStatement()) {
			try (var tables = statement.executeQuery("select count(*) from information_schema.tables where table_schema = 'public'")) {
				assertTrue(tables.next());
				assertEquals(0, tables.getInt(1), "Use un clúster PostgreSQL desechable vacío.");
			}
			statement.execute(Files.readString(Path.of("db/migrations/000-initial-schema.sql")));
			statement.execute(Files.readString(Path.of("db/migrations/001-sale-idempotency.sql")));
			statement.execute("""
					insert into categories (description) values ('Prueba');
					insert into brands (name) values ('Prueba');
					insert into colors (name) values ('Prueba');
					insert into products (name, status, created_at, category_id, brand_id)
					values ('Prueba', true, now(), 1, 1);
					insert into product_variants (product_id, color_id, size, catalog_price, stock, created_at)
					values (1, 1, 37, 10, 2, now());
					insert into sales (total, payment_type, status, created_at)
					values (10, 'CASH', 'COMPLETED', now()), (20, 'CASH', 'COMPLETED', now());
					insert into sale_items (sale_id, variant_id, unit_price, quantity, subtotal)
					values (1, 1, 10, 1, 10), (2, 1, 10, 2, 20)
					""");
			statement.execute(Files.readString(Path.of("db/migrations/002-sale-and-stock-integrity.sql")));
		}

		try (var app = SpringApplication.run(InventoryApplication.class,
				"--spring.profiles.active=prod", "--spring.datasource.url=" + url,
				"--spring.datasource.username=tx01_fixture", "--spring.datasource.password=fixture-only",
				"--spring.jpa.show-sql=false",
				"--logging.level.org.hibernate.SQL=WARN", "--logging.level.org.hibernate.orm.jdbc.bind=WARN",
				"--server.address=127.0.0.1", "--server.port=0")) {
			var jdbc = app.getBean(JdbcTemplate.class);
			var sales = app.getBean(ProcessSaleUseCase.class);
			var cancellations = app.getBean(CancelSaleUseCase.class);
			var adjustments = app.getBean(UpdateStockUseCase.class);
			var history = app.getBean(GetSalesHistoryUseCase.class);
			jdbc.update("""
					insert into users (id, username, role) values (101, 'fixture-101', 'CASHIER'), (102, 'fixture-102', 'CASHIER')
					""");
			assertEquals(2, history.getTodaySales(null).stream().filter(s -> s.getUserId() == null).count());
			assertTrue(history.getTodaySales(101L).isEmpty());
			var historicalSale = history.findVisibleSale(1L, null).orElseThrow();
			assertEquals(new BigDecimal("10.00"), historicalSale.getTotal());
			assertEquals(new BigDecimal("10.00"), historicalSale.getItems().getFirst().getSubtotal());
			assertTrue(history.findVisibleSale(1L, 101L).isEmpty());
			cancellations.cancelSale(1L);
			assertEquals(3, stock(jdbc, 1L));
			assertEquals("CANCELLED", jdbc.queryForObject(
					"select status from sales where id = 1 and user_id is null", String.class));
			assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("insert into sales (total) values (10)"));
			assertThrows(DataIntegrityViolationException.class, () -> jdbc.update("insert into sales (user_id) values (999)"));

			long lastPair = variant(jdbc, 39, 1);
			assertThrows(DataIntegrityViolationException.class, () -> variant(jdbc, 39, 1));
			assertThrows(DataIntegrityViolationException.class, () -> variant(jdbc, 38, -1));
			assertEquals(1, race(() -> trySale(sales, lastPair), () -> trySale(sales, lastPair)));
			assertEquals(0, stock(jdbc, lastPair));
			assertEquals(1, jdbc.queryForObject(
					"select count(*) from sale_items where variant_id = ?", Integer.class, lastPair));
			long saleId = jdbc.queryForObject(
					"select sale_id from sale_items where variant_id = ?", Long.class, lastPair);
			assertThrows(DataIntegrityViolationException.class,
					() -> jdbc.update("update sales set user_id = null where id = ?", saleId));
			assertThrows(DataIntegrityViolationException.class,
					() -> jdbc.update("update sale_items set variant_id = 999 where sale_id = ?", saleId));
			assertThrows(DataIntegrityViolationException.class,
					() -> jdbc.update("update sale_items set unit_price = 0, subtotal = 0 where sale_id = ?", saleId));
			assertThrows(DataIntegrityViolationException.class,
					() -> jdbc.update("update sale_items set quantity = 0, subtotal = 0 where sale_id = ?", saleId));
			assertThrows(DataIntegrityViolationException.class,
					() -> jdbc.update("update sale_items set subtotal = 0 where sale_id = ?", saleId));
			assertEquals(1, race(() -> tryCancel(cancellations, saleId), () -> tryCancel(cancellations, saleId)));
			assertEquals(1, stock(jdbc, lastPair));
			assertEquals("CANCELLED", jdbc.queryForObject("select status from sales where id = ?", String.class, saleId));

			long adjusted = variant(jdbc, 40, 1);
			assertEquals(1, race(() -> trySale(sales, adjusted), () -> {
				try {
					adjustments.updateVariantStock(adjusted, -1);
					return true;
				} catch (InsufficientStockException rejected) {
					return false;
				}
			}));
			assertEquals(0, stock(jdbc, adjusted));

			long available = variant(jdbc, 41, 1);
			long unavailable = variant(jdbc, 42, 0);
			int salesBefore = jdbc.queryForObject("select count(*) from sales", Integer.class);
			int linesBefore = jdbc.queryForObject("select count(*) from sale_items", Integer.class);
			var failedSale = sale(available, unavailable);
			failedSale.setCustomerName("Cliente rollback");
			assertThrows(InsufficientStockException.class, () -> sales.processSale(failedSale));
			assertEquals(1, stock(jdbc, available));
			assertEquals(0, stock(jdbc, unavailable));
			assertEquals(salesBefore, jdbc.queryForObject("select count(*) from sales", Integer.class));
			assertEquals(linesBefore, jdbc.queryForObject("select count(*) from sale_items", Integer.class));
			assertEquals(0, jdbc.queryForObject("select count(*) from customers where name = ?", Integer.class,
					"Cliente rollback"));

			long rejectedLine = variant(jdbc, 43, 1);
			jdbc.execute("alter table sale_items add constraint fixture_reject_line check (variant_id <> "
					+ rejectedLine + ")");
			var failedWrite = sale(available, rejectedLine);
			failedWrite.setCustomerName("Cliente escritura fallida");
			assertThrows(DataIntegrityViolationException.class, () -> sales.processSale(failedWrite));
			assertEquals(1, stock(jdbc, available));
			assertEquals(1, stock(jdbc, rejectedLine));
			assertEquals(salesBefore, jdbc.queryForObject("select count(*) from sales", Integer.class));
			assertEquals(linesBefore, jdbc.queryForObject("select count(*) from sale_items", Integer.class));
			assertEquals(0, jdbc.queryForObject("select count(*) from customers where name = ?", Integer.class,
					"Cliente escritura fallida"));

			long retryVariant = variant(jdbc, 44, 3);
			UUID key = UUID.randomUUID();
			assertEquals(2, race(() -> sales.processSale(sale(retryVariant), key, "same").getId() != null,
					() -> sales.processSale(sale(retryVariant), key, "same").getId() != null));
			long id = jdbc.queryForObject("select sale_id from sale_items where variant_id = ?", Long.class, retryVariant);
			assertEquals(id, sales.processSale(sale(retryVariant), key, "same").getId());
			assertEquals(2, stock(jdbc, retryVariant));
			assertThrows(com.shoestore.inventory.sale.domain.exception.SaleIdempotencyConflictException.class,
					() -> sales.processSale(sale(retryVariant), key, "changed"));
			assertEquals(2, stock(jdbc, retryVariant));
			var anotherActor = sale(retryVariant);
			anotherActor.setUserId(102L);
			sales.processSale(anotherActor, key, "same");
			assertEquals(1, stock(jdbc, retryVariant));

			UUID rejectedKey = UUID.randomUUID();
			assertThrows(InsufficientStockException.class, () -> sales.processSale(sale(unavailable), rejectedKey, "retry"));
			assertEquals(0, jdbc.queryForObject(
					"select count(*) from sale_idempotency where request_key = ?", Integer.class, rejectedKey));

			long monetaryVariant = variant(jdbc, 45, 4);
			var monetarySale = sale(monetaryVariant);
			monetarySale.setTotal(BigDecimal.ZERO);
			monetarySale.setItems(List.of(
					new SaleItem(null, monetaryVariant, new BigDecimal("19.950"), 2, BigDecimal.ZERO),
					new SaleItem(null, monetaryVariant, new BigDecimal("8.35"), 1, BigDecimal.ZERO)));
			long monetaryId = sales.processSale(monetarySale).getId();
			assertEquals(new BigDecimal("48.25"), jdbc.queryForObject(
					"select total from sales where id = ?", BigDecimal.class, monetaryId));
			assertEquals(new BigDecimal("48.25"), jdbc.queryForObject(
					"select sum(subtotal) from sale_items where sale_id = ?", BigDecimal.class, monetaryId));
			var fractionalSale = sale(monetaryVariant);
			fractionalSale.setCustomerName("Cliente fracción");
			fractionalSale.getItems().getFirst().setUnitPrice(new BigDecimal("19.951"));
			assertThrows(InvalidSaleException.class, () -> sales.processSale(fractionalSale));
			var zeroPricedSale = sale(monetaryVariant);
			zeroPricedSale.setCustomerName("Cliente con precio cero");
			zeroPricedSale.getItems().getFirst().setUnitPrice(BigDecimal.ZERO);
			assertThrows(InvalidSaleException.class, () -> sales.processSale(zeroPricedSale));
			assertEquals(1, stock(jdbc, monetaryVariant));
			assertEquals(1, jdbc.queryForObject("select count(distinct sale_id) from sale_items where variant_id = ?",
					Integer.class, monetaryVariant));
			assertEquals(0, jdbc.queryForObject("select count(*) from customers where name in (?, ?)", Integer.class,
					"Cliente fracción", "Cliente con precio cero"));

			long firstColor = variant(jdbc, 46, 3);
			long secondColorId = jdbc.queryForObject("insert into colors(name) values ('Otro color') returning id", Long.class);
			long secondColor = jdbc.queryForObject("""
					insert into product_variants(product_id,color_id,size,catalog_price,stock,created_at)
					values (1,?,46,60,4,now()) returning id
					""", Long.class, secondColorId);
			var colorSale = sale(firstColor, secondColor);
			colorSale.getItems().get(0).setUnitPrice(new BigDecimal("45"));
			colorSale.getItems().get(1).setUnitPrice(new BigDecimal("60"));
			long colorSaleId = sales.processSale(colorSale).getId();
			assertEquals(2, stock(jdbc, firstColor));
			assertEquals(3, stock(jdbc, secondColor));
			assertEquals(new BigDecimal("105.00"), jdbc.queryForObject(
					"select total from sales where id = ?", BigDecimal.class, colorSaleId));
			assertEquals(List.of(new BigDecimal("45.00"), new BigDecimal("60.00")), jdbc.queryForList(
					"select unit_price from sale_items where sale_id = ? order by variant_id", BigDecimal.class, colorSaleId));
			jdbc.update("update products set status = false where id = 1");
			var inactiveSale = sale(firstColor);
			inactiveSale.setCustomerName("Cliente producto inactivo");
			int countBeforeInactive = jdbc.queryForObject("select count(*) from sales", Integer.class);
			assertThrows(InvalidSaleException.class, () -> sales.processSale(inactiveSale));
			assertEquals(2, stock(jdbc, firstColor));
			assertEquals(countBeforeInactive, jdbc.queryForObject("select count(*) from sales", Integer.class));
			assertEquals(0, jdbc.queryForObject("select count(*) from customers where name = ?", Integer.class,
					"Cliente producto inactivo"));
			cancellations.cancelSale(colorSaleId);
			assertEquals(3, stock(jdbc, firstColor));
			assertEquals(4, stock(jdbc, secondColor));
		}
	}

	private static int race(Callable<Boolean> first, Callable<Boolean> second) throws Exception {
		try (var executor = Executors.newFixedThreadPool(2)) {
			var start = new CyclicBarrier(2);
			var a = executor.submit(() -> { start.await(10, TimeUnit.SECONDS); return first.call(); });
			var b = executor.submit(() -> { start.await(10, TimeUnit.SECONDS); return second.call(); });
			return (a.get(15, TimeUnit.SECONDS) ? 1 : 0) + (b.get(15, TimeUnit.SECONDS) ? 1 : 0);
		}
	}

	private static boolean trySale(ProcessSaleUseCase sales, long variant) {
		try {
			sales.processSale(sale(variant));
			return true;
		} catch (InsufficientStockException rejected) {
			return false;
		}
	}

	private static boolean tryCancel(CancelSaleUseCase cancellations, long saleId) {
		try {
			cancellations.cancelSale(saleId);
			return true;
		} catch (SaleAlreadyCancelledException rejected) {
			return false;
		}
	}

	private static Sale sale(Long... variants) {
		var sale = new Sale();
		var price = new BigDecimal("10.00");
		sale.setUserId(101L);
		sale.setPaymentType(PaymentType.CASH);
		sale.setTotal(price.multiply(BigDecimal.valueOf(variants.length)));
		sale.setItems(List.of(variants).stream().map(id -> new SaleItem(null, id, price, 1, price)).toList());
		return sale;
	}

	private static long variant(JdbcTemplate jdbc, int size, int stock) {
		return jdbc.queryForObject("""
				insert into product_variants(product_id,color_id,size,catalog_price,stock,created_at)
				values (1,1,?,10,?,now()) returning id
				""", Long.class, size, stock);
	}

	private static int stock(JdbcTemplate jdbc, long variant) {
		return jdbc.queryForObject("select stock from product_variants where id = ?", Integer.class, variant);
	}
}
