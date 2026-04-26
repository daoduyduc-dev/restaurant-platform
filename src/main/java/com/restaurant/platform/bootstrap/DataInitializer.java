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
import com.restaurant.platform.modules.reservation.repository.ReservationRepository;
import com.restaurant.platform.modules.order.repository.OrderRepository;

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
    private final ReservationRepository reservationRepo;
    private final OrderRepository orderRepo;

    @Override
    @Transactional
    public void run(String... args) {
        // Always clean and reseed tables to ensure correct structure
        log.info("Cleaning old table data and related reservations...");
        try {
            orderRepo.deleteAllOrderItemsNative();
            log.info("Old order items deleted successfully");
            orderRepo.deleteAllOrdersNative();
            log.info("Old orders deleted successfully");
            reservationRepo.deleteAllNative();
            log.info("Old reservations deleted successfully");
            tableRepo.deleteAllNative();
            log.info("Old tables deleted successfully");
        } catch (Exception e) {
            log.warn("Table cleanup warning: {}", e.getMessage());
        }

        // Check if all required users exist
        boolean adminExists = userRepo.findByEmail("admin@servegenius.com").isPresent();
        boolean staffExists = userRepo.findByEmail("staff@servegenius.com").isPresent();
        boolean customerExists = userRepo.findByEmail("customer@servegenius.com").isPresent();

        if (adminExists && staffExists && customerExists) {
            log.info("All users already seeded. Only reseeding tables...");
            seedTables();
            return;
        }

        // Check if this is first time (no admin)
        if (!adminExists) {
            log.info("First time setup - seeding all data...");

            // Clean slate if partial data exists
            try {
                menuItemRepo.deleteAll();
                categoryRepo.deleteAll();
            } catch (Exception e) {
                log.warn("Cleanup warning: {}", e.getMessage());
            }

            log.info("========== SEEDING DATABASE ==========");

            // 1. Create Permissions and Roles
            seedPermissionsAndRoles();

            // 2. Create all users
            seedAllUsers();

            // 3. Create categories and menu items
            seedMenuItems();

            // 4. Create tables
            seedTables();

            log.info("========== DATABASE SEEDED SUCCESSFULLY ==========");
        } else {
            // Admin exists but some users are missing - just create missing users
            log.info("Some users missing - creating them with existing roles...");

            Role staffRole = roleRepo.findByName(RoleName.STAFF).orElseThrow(() ->
                new RuntimeException("Staff role not found. Database is in inconsistent state."));
            Role customerRole = roleRepo.findByName(RoleName.CUSTOMER).orElseThrow(() ->
                new RuntimeException("Customer role not found. Database is in inconsistent state."));

            if (!staffExists) {
                User staff = User.builder()
                        .name("Ethan Nguyen")
                        .email("staff@servegenius.com")
                        .password(passwordEncoder.encode("staff123"))
                        .phone("0923456789")
                        .active(true)
                        .roles(Set.of(staffRole))
                        .build();
                userRepo.save(staff);
                log.info("Created staff user");
            }

            if (!customerExists) {
                User customer = User.builder()
                        .name("Emily Chen")
                        .email("customer@servegenius.com")
                        .password(passwordEncoder.encode("customer123"))
                        .phone("0945678901")
                        .active(true)
                        .roles(Set.of(customerRole))
                        .build();
                userRepo.save(customer);
                log.info("Created customer user");
            }

            seedTables();
            log.info("========== MISSING USERS CREATED ==========");
        }
    }

    private void seedPermissionsAndRoles() {
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
            {"ORDER", "ORDER_ASSIGN", "Assign orders"},
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
        // ADMIN gets everything (merged Admin + Manager)
        Role adminRole = Role.builder()
                .name(RoleName.ADMIN)
                .permissions(new HashSet<>(perms.values()))
                .build();
        roleRepo.save(adminRole);

        // STAFF (merged WAITER + RECEPTIONIST + KITCHEN - all operational permissions)
        Role staffRole = Role.builder()
                .name(RoleName.STAFF)
                .permissions(Set.of(
                    perms.get("MENU_VIEW"),
                    perms.get("TABLE_VIEW"), perms.get("TABLE_UPDATE_STATUS"),
                    perms.get("ORDER_VIEW"), perms.get("ORDER_CREATE"), perms.get("ORDER_UPDATE"),
                    perms.get("ORDER_PAY"), perms.get("ORDER_KITCHEN_VIEW"), perms.get("ORDER_KITCHEN_UPDATE"),
                    perms.get("RESERVATION_VIEW"), perms.get("RESERVATION_CREATE"),
                    perms.get("RESERVATION_CHECKIN"), perms.get("RESERVATION_CANCEL"),
                    perms.get("PAYMENT_VIEW"), perms.get("PAYMENT_CREATE"),
                    perms.get("LOYALTY_VIEW")
                ))
                .build();
        roleRepo.save(staffRole);

        // CUSTOMER
        Role customerRole = Role.builder()
                .name(RoleName.CUSTOMER)
                .permissions(Set.of(
                    perms.get("MENU_VIEW"),
                    perms.get("ORDER_CREATE"),
                    perms.get("RESERVATION_CREATE"), perms.get("RESERVATION_CANCEL"),
                    perms.get("LOYALTY_VIEW"), perms.get("LOYALTY_REDEEM")
                ))
                .build();
        roleRepo.save(customerRole);

        log.info("Created 3 roles (ADMIN, STAFF, CUSTOMER)");
    }

    private void seedAllUsers() {
        // Get roles
        Role adminRole = roleRepo.findByName(RoleName.ADMIN).orElseThrow();
        Role staffRole = roleRepo.findByName(RoleName.STAFF).orElseThrow();
        Role customerRole = roleRepo.findByName(RoleName.CUSTOMER).orElseThrow();

        User admin = User.builder()
                .name("Admin Chef")
                .email("admin@servegenius.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("0901234567")
                .active(true)
                .roles(Set.of(adminRole))
                .build();
        userRepo.save(admin);

        User staff = User.builder()
                .name("Ethan Nguyen")
                .email("staff@servegenius.com")
                .password(passwordEncoder.encode("staff123"))
                .phone("0923456789")
                .active(true)
                .roles(Set.of(staffRole))
                .build();
        userRepo.save(staff);

        User customer = User.builder()
                .name("Emily Chen")
                .email("customer@servegenius.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("0945678901")
                .active(true)
                .roles(Set.of(customerRole))
                .build();
        userRepo.save(customer);

        log.info("Created 3 users (admin, staff, customer)");
    }

    private void seedMenuItems() {
        // Create Menu Categories
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
    }

    private void seedTables() {
        // 6. Create Tables - Fixed layout with Floor 1, Floor 2, and VIP Room
        // FLOOR 1 - Main Dining Area (12 tables)
        tableRepo.saveAll(List.of(
            // Window side tables (2-person)
            Table.builder().name("F1-01").capacity(2).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Window").positionX(50.0).positionY(50.0).isVipRoom(false).build(),
            Table.builder().name("F1-02").capacity(2).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Window").positionX(50.0).positionY(150.0).isVipRoom(false).build(),
            Table.builder().name("F1-03").capacity(2).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Window").positionX(50.0).positionY(250.0).isVipRoom(false).build(),
            Table.builder().name("F1-04").capacity(2).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Window").positionX(50.0).positionY(350.0).isVipRoom(false).build(),

            // Center area tables (4-person)
            Table.builder().name("F1-05").capacity(4).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Center").positionX(200.0).positionY(80.0).isVipRoom(false).build(),
            Table.builder().name("F1-06").capacity(4).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Center").positionX(200.0).positionY(220.0).isVipRoom(false).build(),
            Table.builder().name("F1-07").capacity(4).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Center").positionX(350.0).positionY(80.0).isVipRoom(false).build(),
            Table.builder().name("F1-08").capacity(4).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Center").positionX(350.0).positionY(220.0).isVipRoom(false).build(),

            // Large tables (6-8 person)
            Table.builder().name("F1-09").capacity(6).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Center").positionX(520.0).positionY(100.0).isVipRoom(false).build(),
            Table.builder().name("F1-10").capacity(6).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Center").positionX(520.0).positionY(250.0).isVipRoom(false).build(),

            // Corner tables
            Table.builder().name("F1-11").capacity(4).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Corner").positionX(680.0).positionY(50.0).isVipRoom(false).build(),
            Table.builder().name("F1-12").capacity(4).status(TableStatus.AVAILABLE).floor(1).floorName("Floor 1").zone("Corner").positionX(680.0).positionY(350.0).isVipRoom(false).build()
        ));

        // FLOOR 2 - Additional Seating (10 tables)
        tableRepo.saveAll(List.of(
            // Balcony tables (2-person)
            Table.builder().name("F2-01").capacity(2).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Balcony").positionX(50.0).positionY(50.0).isVipRoom(false).build(),
            Table.builder().name("F2-02").capacity(2).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Balcony").positionX(50.0).positionY(150.0).isVipRoom(false).build(),
            Table.builder().name("F2-03").capacity(2).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Balcony").positionX(50.0).positionY(250.0).isVipRoom(false).build(),

            // Main area (4-person)
            Table.builder().name("F2-04").capacity(4).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Main").positionX(200.0).positionY(80.0).isVipRoom(false).build(),
            Table.builder().name("F2-05").capacity(4).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Main").positionX(200.0).positionY(220.0).isVipRoom(false).build(),
            Table.builder().name("F2-06").capacity(4).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Main").positionX(350.0).positionY(80.0).isVipRoom(false).build(),
            Table.builder().name("F2-07").capacity(4).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Main").positionX(350.0).positionY(220.0).isVipRoom(false).build(),

            // Large tables
            Table.builder().name("F2-08").capacity(6).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Main").positionX(520.0).positionY(100.0).isVipRoom(false).build(),
            Table.builder().name("F2-09").capacity(8).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Main").positionX(520.0).positionY(280.0).isVipRoom(false).build(),
            Table.builder().name("F2-10").capacity(4).status(TableStatus.AVAILABLE).floor(2).floorName("Floor 2").zone("Corner").positionX(680.0).positionY(150.0).isVipRoom(false).build()
        ));

        // VIP ROOM - Private Dining (3 tables)
        tableRepo.saveAll(List.of(
            Table.builder().name("VIP-01").capacity(8).status(TableStatus.AVAILABLE).floor(1).floorName("VIP Room").zone("Private").positionX(200.0).positionY(150.0).isVipRoom(true).build(),
            Table.builder().name("VIP-02").capacity(10).status(TableStatus.AVAILABLE).floor(1).floorName("VIP Room").zone("Private").positionX(450.0).positionY(150.0).isVipRoom(true).build(),
            Table.builder().name("VIP-03").capacity(12).status(TableStatus.AVAILABLE).floor(1).floorName("VIP Room").zone("Private").positionX(325.0).positionY(300.0).isVipRoom(true).build()
        ));

        log.info("Created 25 fixed tables (12 on Floor 1, 10 on Floor 2, 3 in VIP Room)");

        log.info("========== DATABASE SEEDED SUCCESSFULLY ==========");
    }
}
