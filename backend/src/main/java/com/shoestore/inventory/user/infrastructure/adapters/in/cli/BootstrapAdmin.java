package com.shoestore.inventory.user.infrastructure.adapters.in.cli;

import com.shoestore.inventory.user.application.ports.in.UserManagementUseCase;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.WebApplicationContext;

import java.nio.charset.StandardCharsets;

@Component
@Profile("bootstrap-admin")
class BootstrapAdmin implements ApplicationRunner {
	private final ApplicationContext context;
	private final UserManagementUseCase users;

	BootstrapAdmin(ApplicationContext context, UserManagementUseCase users) {
		this.context = context;
		this.users = users;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (context instanceof WebApplicationContext || context.getEnvironment().matchesProfiles("demo", "test")) {
			throw new IllegalStateException("bootstrap-admin requiere ejecución sin servidor web y sin perfiles demo o test.");
		}
		String username = required("TORRES_BOOTSTRAP_ADMIN_USERNAME").strip();
		String fullName = required("TORRES_BOOTSTRAP_ADMIN_FULL_NAME").strip();
		String password = required("TORRES_BOOTSTRAP_ADMIN_PASSWORD");
		if (username.length() > 255 || fullName.length() > 255 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
			throw new IllegalStateException("El nombre y el usuario admiten hasta 255 caracteres y la contraseña hasta 72 bytes.");
		}
		users.createFirstAdmin(username, fullName, password);
	}

	private String required(String key) {
		String value = context.getEnvironment().getProperty(key);
		if (!StringUtils.hasText(value)) {
			throw new IllegalStateException("Falta la configuración obligatoria " + key + ".");
		}
		return value;
	}
}
