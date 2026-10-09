package com.medipulse.backend.config;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;


@Configuration
public class FlywayConfig {

    @Bean
    public Flyway flyway(
    DataSource dataSource,
    @Value("${spring.flyway.locations:db/migration}") String[] locations,
    @Value("${spring.flyway.table:flyway_schema_history}") String table,
    @Value("${spring.flyway.baseline-on-migrate:false}") boolean baselineOnMigrate,
    @Value("${spring.flyway.enabled:false}") boolean enabled) {
        Flyway flyway = Flyway.configure()
        .dataSource(dataSource)
        .locations(locations)
        .table(table)
        .baselineOnMigrate(baselineOnMigrate)
        .load();
        if (enabled) {
            flyway.migrate();
        }
    return flyway;
}


@Bean
public static BeanFactoryPostProcessor entityManagerFactoryDependsOnFlyway() {
    return beanFactory -> {
        ConfigurableListableBeanFactory bf = (ConfigurableListableBeanFactory) beanFactory;
        for (String name : bf.getBeanNamesForType(EntityManagerFactory.class, true, false)) {
            Set<String> dependsOn = new LinkedHashSet<>();
            String[] existing = bf.getBeanDefinition(name).getDependsOn();
            if (existing != null) {
                dependsOn.addAll(Arrays.asList(existing));
            }
        dependsOn.add("flyway");
        bf.getBeanDefinition(name).setDependsOn(dependsOn.toArray(new String[0]));
    }
};
}
}
