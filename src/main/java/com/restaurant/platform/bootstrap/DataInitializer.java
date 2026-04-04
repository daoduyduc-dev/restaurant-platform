package com.restaurant.platform.bootstrap;

import com.restaurant.platform.modules.auth.entity.*;
import com.restaurant.platform.modules.auth.repository.*;
import com.restaurant.platform.modules.menu.entity.Category;
import com.restaurant.platform.modules.menu.entity.MenuItem;
import com.restaurant.platform.modules.menu.repository.CategoryRepository;
import com.restaurant.platform.modules.menu.repository.MenuItemRepository;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.repository.TableRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final PermissionRepository permRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepo;
    private final MenuItemRepository menuItemRepo;
    private final TableRepository tableRepo;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.findByEmail("admin@servegenius.com").isPresent()) {
            log.info("Database already seeded (admin user exists). Skipping.");
            return;
        }
        // Clean slate if partial data exists
        log.info("Cleaning old seed data if any...");
        try {
            menuItemRepo.deleteAll();
            categoryRepo.deleteAll();
            tableRepo.deleteAll();
        } catch (Exception e) {
            log.warn("Cleanup warning: {}", e.getMessage());
        }

        log.info("========== SEEDING DATABASE ==========");

        // 1. Create Permissions
        Map<String, Permission> perms = new HashMap<>();
        String[][] permDefs = {
            // Module, Code, Description
            {"MENU", "MENU_VIEW", "View menu items"},
            {"MENU", "MENU_CREATE", "Create menu items"},
            {"MENU", "MENU_UPDATE", "Update menu items"},
            {"MENU", "MENU_DELETE", "Delete menu items"},
            {"TABLE", "TABLE_VIEW", "View tables"},
            {"TABLE", "TABLE_CREATE", "Create tables"},
            {"TABLE", "TABLE_UPDATE_STATUS", "Update table status"},
            {"ORDER", "ORDER_VIEW", "View orders"},
            {"ORDER", "ORDER_CREATE", "Create orders"},
            {"ORDER", "ORDER_UPDATE", "Update orders"},
            {"ORDER", "ORDER_PAY", "Pay orders"},
            {"ORDER", "ORDER_KITCHEN_VIEW", "View kitchen orders"},
            {"ORDER", "ORDER_KITCHEN_UPDATE", "Update kitchen order status"},
            {"RESERVATION", "RESERVATION_VIEW", "View reservations"},
            {"RESERVATION", "RESERVATION_CREATE", "Create reservations"},
            {"RESERVATION", "RESERVATION_CHECKIN", "Check-in reservations"},
            {"RESERVATION", "RESERVATION_CANCEL", "Cancel reservations"},
            {"PAYMENT", "PAYMENT_CREATE", "Create payments"},
            {"PAYMENT", "PAYMENT_VIEW", "View payments"},
            {"LOYALTY", "LOYALTY_VIEW", "View loyalty points"},
            {"LOYALTY", "LOYALTY_REDEEM", "Redeem loyalty points"},
            {"DASHBOARD", "DASHBOARD_VIEW", "View dashboard"},
            {"REPORT", "REPORT_VIEW", "View reports"},
            {"USER", "USER_VIEW", "View users"},
            {"USER", "USER_CREATE", "Create users"},
            {"USER", "USER_UPDATE", "Update users"},
        };

        for (String[] pd : permDefs) {
            Permission p = permRepo.findByCode(pd[1]).orElseGet(() -> {
                Permission newP = Permission.builder()
                        .module(PermissionModule.valueOf(pd[0]))
                        .code(pd[1])
                        .description(pd[2])
                        .active(true)
                        .build();
                return permRepo.save(newP);
            });
            perms.put(pd[1], p);
        }
        log.info("Created {} permissions", perms.size());

        // 2. Create Roles with Permissions
        // ADMIN gets everything
        Role adminRole = Role.builder()
                .name(RoleName.ADMIN)
                .permissions(new HashSet<>(perms.values()))
                .build();
        roleRepo.save(adminRole);

        // MANAGER gets most things
        Role managerRole = Role.builder()
                .name(RoleName.MANAGER)
                .permissions(Set.of(
                    perms.get("MENU_VIEW"), perms.get("TABLE_VIEW"), perms.get("TABLE_UPDATE_STATUS"),
                    perms.get("ORDER_VIEW"), perms.get("ORDER_PAY"),
                    perms.get("RESERVATION_VIEW"),
                    perms.get("PAYMENT_VIEW"), perms.get("PAYMENT_CREATE"),
                    perms.get("DASHBOARD_VIEW"), perms.get("REPORT_VIEW"),
                    perms.get("USER_VIEW")
                ))
                .build();
        roleRepo.save(managerRole);

        // WAITER
        Role waiterRole = Role.builder()
                .name(RoleName.WAITER)
                .permissions(Set.of(
                    perms.get("MENU_VIEW"), perms.get("TABLE_VIEW"), perms.get("TABLE_UPDATE_STATUS"),
                    perms.get("ORDER_VIEW"), perms.get("ORDER_CREATE"), perms.get("ORDER_UPDATE"), perms.get("ORDER_PAY"),
                    perms.get("RESERVATION_VIEW")
                ))
                .build();
        roleRepo.save(waiterRole);

        // RECEPTIONIST
        Role receptionistRole = Role.builder()
                .name(RoleName.RECEPTIONIST)
                .permissions(Set.of(
                    perms.get("TABLE_VIEW"), perms.get("TABLE_UPDATE_STATUS"),
                    perms.get("RESERVATION_VIEW"), perms.get("RESERVATION_CREATE"),
                    perms.get("RESERVATION_CHECKIN"), perms.get("RESERVATION_CANCEL"),
                    perms.get("ORDER_CREATE"), perms.get("ORDER_UPDATE")
                ))
                .build();
        roleRepo.save(receptionistRole);

        // KITCHEN
        Role kitchenRole = Role.builder()
                .name(RoleName.KITCHEN)
                .permissions(Set.of(
                    perms.get("MENU_VIEW"),
                    perms.get("ORDER_KITCHEN_VIEW"), perms.get("ORDER_KITCHEN_UPDATE")
                ))
                .build();
        roleRepo.save(kitchenRole);

        // CUSTOMER
        Role customerRole = Role.builder()
                .name(RoleName.CUSTOMER)
                .permissions(Set.of(
                    perms.get("MENU_VIEW"),
                    perms.get("RESERVATION_CREATE"), perms.get("RESERVATION_CANCEL"),
                    perms.get("LOYALTY_VIEW"), perms.get("LOYALTY_REDEEM")
                ))
                .build();
        roleRepo.save(customerRole);

        log.info("Created 5 roles");

        // 3. Create Users
        User admin = User.builder()
                .name("Admin Chef")
                .email("admin@servegenius.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("0901234567")
                .active(true)
                .roles(Set.of(adminRole))
                .build();
        userRepo.save(admin);

        User manager = User.builder()
                .name("Sophie Laurent")
                .email("manager@servegenius.com")
                .password(passwordEncoder.encode("manager123"))
                .phone("0912345678")
                .active(true)
                .roles(Set.of(managerRole))
                .build();
        userRepo.save(manager);

        User waiter = User.builder()
                .name("Ethan Nguyen")
                .email("waiter@servegenius.com")
                .password(passwordEncoder.encode("waiter123"))
                .phone("0923456789")
                .active(true)
                .roles(Set.of(waiterRole))
                .build();
        userRepo.save(waiter);

        User receptionist = User.builder()
                .name("Diana Ross")
                .email("receptionist@servegenius.com")
                .password(passwordEncoder.encode("reception123"))
                .phone("0934567890")
                .active(true)
                .roles(Set.of(receptionistRole))
                .build();
        userRepo.save(receptionist);

        User kitchen = User.builder()
                .name("Marco Kitchen")
                .email("kitchen@servegenius.com")
                .password(passwordEncoder.encode("kitchen123"))
                .phone("0945678902")
                .active(true)
                .roles(Set.of(kitchenRole))
                .build();
        userRepo.save(kitchen);

        User customer = User.builder()
                .name("Emily Chen")
                .email("customer@servegenius.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("0945678901")
                .active(true)
                .roles(Set.of(customerRole))
                .build();
        userRepo.save(customer);

        log.info("Created 5 users");

        // 4. Create Menu Categories
        Category appetizer = Category.builder().name("Appetizer").description("Starters and small plates").build();
        Category mainCourse = Category.builder().name("Main Course").description("Signature entrees").build();
        Category dessert = Category.builder().name("Dessert").description("Sweet finishes").build();
        Category beverage = Category.builder().name("Beverage").description("Wines, cocktails, and more").build();
        categoryRepo.saveAll(List.of(appetizer, mainCourse, dessert, beverage));

        // 5. Create Menu Items
        menuItemRepo.saveAll(List.of(
            MenuItem.builder().name("Truffle Ribeye Steak").description("Prime ribeye with black truffle butter").price(new BigDecimal("85.00")).imageUrl("https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=300&fit=crop").preparationTime(25).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Lobster Ravioli").description("Handmade pasta with Maine lobster filling").price(new BigDecimal("42.00")).imageUrl("https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop").preparationTime(20).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Oysters Rockefeller").description("Fresh oysters with spinach and Pernod").price(new BigDecimal("28.00")).imageUrl("https://images.unsplash.com/photo-1615141982883-c7da0e69cb47?w=400&h=300&fit=crop").preparationTime(15).category(appetizer).available(false).build(),
            MenuItem.builder().name("Wagyu Beef Tartare").description("A5 Wagyu with quail egg yolk").price(new BigDecimal("36.00")).imageUrl("https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop").preparationTime(12).category(appetizer).available(true).build(),
            MenuItem.builder().name("Chocolate Soufflé").description("Dark chocolate with crème anglaise").price(new BigDecimal("24.00")).imageUrl("https://images.unsplash.com/photo-1624492411802-894101cc2956?w=400&h=300&fit=crop").preparationTime(18).category(dessert).available(true).build(),
            MenuItem.builder().name("Dom Pérignon 2015").description("Prestigious vintage champagne").price(new BigDecimal("450.00")).imageUrl("https://images.unsplash.com/photo-1590485503023-e1757820a4b8?w=400&h=300&fit=crop").preparationTime(2).category(beverage).available(true).build(),
            MenuItem.builder().name("Pan-Seared Foie Gras").description("With fig compote and brioche toast").price(new BigDecimal("52.00")).imageUrl("https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop").preparationTime(15).category(appetizer).available(true).build(),
            MenuItem.builder().name("Crème Brûlée").description("Classic vanilla bean custard").price(new BigDecimal("18.00")).imageUrl("https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop").preparationTime(10).category(dessert).available(true).build()
        ));
        log.info("Created 4 categories and 8 menu items");

        // 6. Create Tables
        tableRepo.saveAll(List.of(
            Table.builder().name("T1").capacity(2).status(TableStatus.AVAILABLE).build(),
            Table.builder().name("T2").capacity(4).status(TableStatus.OCCUPIED).build(),
            Table.builder().name("T3").capacity(2).status(TableStatus.RESERVED).build(),
            Table.builder().name("T4").capacity(6).status(TableStatus.AVAILABLE).build(),
            Table.builder().name("T5").capacity(4).status(TableStatus.OCCUPIED).build(),
            Table.builder().name("T6").capacity(8).status(TableStatus.AVAILABLE).build(),
            Table.builder().name("T7").capacity(4).status(TableStatus.RESERVED).build(),
            Table.builder().name("T8").capacity(2).status(TableStatus.AVAILABLE).build(),
            Table.builder().name("VIP1").capacity(10).status(TableStatus.AVAILABLE).build(),
            Table.builder().name("VIP2").capacity(12).status(TableStatus.RESERVED).build()
        ));
        log.info("Created 10 tables");

        log.info("========== DATABASE SEEDED SUCCESSFULLY ==========");
    }
}
