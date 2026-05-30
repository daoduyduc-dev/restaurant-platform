package com.restaurant.platform;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
public class FixDbTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void fixDb() {
        try {
            jdbcTemplate.execute("ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS vip_table_fee NUMERIC(12, 2) NOT NULL DEFAULT 25.00;");
            System.out.println(">>> COLUMN ADDED SUCCESSFULLY <<<");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
