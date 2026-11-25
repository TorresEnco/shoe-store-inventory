package com.shoestore.inventory.shared.config;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

@Configuration(proxyBeanMethods = false)
class DatabaseSettings {
	@Bean
	static BeanFactoryPostProcessor requireDatabaseSettings(Environment environment) {
		return beanFactory -> {
			require(environment, "spring.datasource.url", "SPRING_DATASOURCE_URL");
			require(environment, "spring.datasource.username", "SPRING_DATASOURCE_USERNAME");
			require(environment, "spring.datasource.password", "SPRING_DATASOURCE_PASSWORD");
		};
	}

	private static void require(Environment environment, String property, String envName) {
		if (!StringUtils.hasText(environment.getProperty(property))) {
			throw new IllegalStateException("Falta la configuración obligatoria " + envName + ".");
		}
	}
}
