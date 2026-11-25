package com.shoestore.inventory.shared.config;

import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.model.Brand;
import com.shoestore.inventory.product.domain.model.Category;
import com.shoestore.inventory.product.domain.model.Color;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.user.application.ports.out.UserRepositoryPort;
import com.shoestore.inventory.user.domain.model.Role;
import com.shoestore.inventory.user.domain.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Profile("demo & !prod & !test & !bootstrap-admin")
public class DataInitializer implements CommandLineRunner {

	private final ProductRepositoryPort productRepositoryPort;
	private final UserRepositoryPort userRepositoryPort;
	private final PasswordEncoder passwordEncoder;
	private final String adminPassword;
	private final String cashierPassword;
	private final Map<String, Category> categories = new HashMap<>();
	private final Map<String, Brand> brands = new HashMap<>();
	private final Map<String, Color> colors = new HashMap<>();

	public DataInitializer(ProductRepositoryPort productRepositoryPort, UserRepositoryPort userRepositoryPort,
			PasswordEncoder passwordEncoder,
			@Value("${TORRES_DEMO_ADMIN_PASSWORD}") String adminPassword,
			@Value("${TORRES_DEMO_CASHIER_PASSWORD}") String cashierPassword) {
		Assert.hasText(adminPassword, "TORRES_DEMO_ADMIN_PASSWORD es obligatoria en demo.");
		Assert.hasText(cashierPassword, "TORRES_DEMO_CASHIER_PASSWORD es obligatoria en demo.");
		this.productRepositoryPort = productRepositoryPort;
		this.userRepositoryPort = userRepositoryPort;
		this.passwordEncoder = passwordEncoder;
		this.adminPassword = adminPassword;
		this.cashierPassword = cashierPassword;
	}

	@Override
	@Transactional
	public void run(String... args) {
		seedProductsIfEmpty();
		seedUsersIfMissing();
	}

	private void seedProductsIfEmpty() {
		if (!productRepositoryPort.findAll().isEmpty()) {
			return;
		}

		seedProduct("Mocasín Clásico Cuero", "Alva", "Casual", "Marrón Caramelo", "120.00",
				new int[] { 38, 39, 40, 41 }, new int[] { 4, 2, 0, 5 });
		seedProduct("Zapatilla Urbana Cuero", "Bruma", "Zapatillas", "Blanco Tiza", "145.00",
				new int[] { 37, 38, 39, 40 }, new int[] { 3, 6, 1, 4 });
		seedProduct("Botín Cuero Genuino", "Andino", "Formal", "Negro Humo", "180.00",
				new int[] { 39, 40, 41, 42 }, new int[] { 2, 3, 0, 1 });
		seedProduct("Zapato Formal Derby", "Alva", "Formal", "Café Oscuro", "160.00",
				new int[] { 38, 39, 40, 41 }, new int[] { 0, 3, 4, 2 });
	}
	private void seedUsersIfMissing() {
		seedUserIfMissing("Administrador de demostración", "demo-admin", adminPassword, Role.ADMIN);
		seedUserIfMissing("Cajero de demostración", "demo-cashier", cashierPassword, Role.CASHIER);
	}

	private void seedUserIfMissing(String fullName, String username, String rawPassword, Role role) {
		if (userRepositoryPort.existsByUsername(username)) {
			return;
		}
		User user = new User();
		user.setFullName(fullName);
		user.setUsername(username);
		user.setPassword(passwordEncoder.encode(rawPassword));
		user.setRole(role);
		user.setActive(Boolean.TRUE);
		userRepositoryPort.save(user);
	}

	private void seedProduct(String name, String brandName, String categoryName, String colorName,
			String price, int[] sizes, int[] stocks) {
		Product product = new Product();
		product.setName(name);
		product.setDescription("Modelo " + name);
		product.setCategory(resolveCategory(categoryName));
		product.setBrand(resolveBrand(brandName));
		product.setStatus(Boolean.TRUE);

		List<ProductVariant> variants = new ArrayList<>();
		for (int i = 0; i < sizes.length; i++) {
			variants.add(new ProductVariant(
					null,
					null,
					resolveColor(colorName),
					sizes[i],
					new BigDecimal(price),
					stocks[i],
					null));
		}
		product.setVariants(variants);

		Product saved = productRepositoryPort.save(product);
		rememberCatalogs(saved);
	}

	private void rememberCatalogs(Product product) {
		if (product.getCategory() != null) {
			categories.put(product.getCategory().getDescription(), product.getCategory());
		}
		if (product.getBrand() != null) {
			brands.put(product.getBrand().getName(), product.getBrand());
		}
		if (product.getVariants() != null) {
			for (ProductVariant variant : product.getVariants()) {
				if (variant.getColor() != null && variant.getColor().getName() != null) {
					colors.put(variant.getColor().getName(), variant.getColor());
				}
			}
		}
	}

	private Category resolveCategory(String name) {
		return categories.computeIfAbsent(name, key -> new Category(null, key));
	}

	private Brand resolveBrand(String name) {
		return brands.computeIfAbsent(name, key -> new Brand(null, key));
	}

	private Color resolveColor(String name) {
		return colors.computeIfAbsent(name, key -> new Color(null, key));
	}
}
