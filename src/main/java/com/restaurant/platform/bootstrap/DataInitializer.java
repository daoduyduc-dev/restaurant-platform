package com.restaurant.platform.bootstrap;

import com.restaurant.platform.modules.auth.entity.*;
import com.restaurant.platform.modules.auth.repository.*;
import com.restaurant.platform.modules.menu.entity.Category;
import com.restaurant.platform.modules.menu.entity.MenuItem;
import com.restaurant.platform.modules.menu.repository.CategoryRepository;
import com.restaurant.platform.modules.menu.repository.MenuItemRepository;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.enums.TableType;
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
        // Check if all required users exist
        boolean adminExists = userRepo.findByEmail("admin@servegenius.com").isPresent();
        boolean staffExists = userRepo.findByEmail("staff@servegenius.com").isPresent();
        boolean customerExists = userRepo.findByEmail("customer@servegenius.com").isPresent();
        boolean tablesExist = tableRepo.count() > 0;

        if (adminExists && staffExists && customerExists) {
            if (tablesExist) {
                log.info("Users and table data already exist. Seeding menu items...");
                seedMenuItems();
                return;
            }

            log.info("All users already seeded. Seeding default tables because none exist...");
            seedTables();
            return;
        }

        // Check if this is first time (no admin)
        if (!adminExists) {
            log.info("First time setup - seeding all data...");

            // Clean slate if partial data exists
            try {
                menuItemRepo.deleteAll();
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
            if (!tablesExist) {
                seedTables();
            } else {
                log.info("Existing table data detected. Skipping default table seed.");
            }

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

            if (!tablesExist) {
                seedTables();
            } else {
                log.info("Existing table data detected. Skipping default table seed.");
            }
            log.info("Seeding menu items...");
            seedMenuItems();
            log.info("========== MISSING USERS AND DATA CREATED ==========");
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
        // Clear old items first
        menuItemRepo.deleteAll();
        
        // Get or create Menu Categories
        Category appetizer = categoryRepo.findByName("Appetizer")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Appetizer").description("Starters and small plates").build()));
        Category mainCourse = categoryRepo.findByName("Main Course")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Main Course").description("Signature entrees").build()));
        Category dessert = categoryRepo.findByName("Dessert")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Dessert").description("Sweet finishes").build()));
        Category beverage = categoryRepo.findByName("Beverage")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Beverage").description("Wines, cocktails, and more").build()));
        Category soup = categoryRepo.findByName("Soup")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Soup").description("Hot and cold soups").build()));
        Category salad = categoryRepo.findByName("Salad")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Salad").description("Fresh salads and greens").build()));
        Category seafood = categoryRepo.findByName("Seafood")
            .orElseGet(() -> categoryRepo.save(Category.builder().name("Seafood").description("Fresh seafood dishes").build()));

        // 5. Create Menu Items
        menuItemRepo.saveAll(List.of(
            // Main Course
            MenuItem.builder().name("Truffle Ribeye Steak").description("Prime ribeye with black truffle butter").price(new BigDecimal("85.00")).imageUrl("https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=300&fit=crop").preparationTime(25).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Lobster Ravioli").description("Handmade pasta with Maine lobster filling").price(new BigDecimal("42.00")).imageUrl("https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop").preparationTime(20).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Pan-Seared Duck Breast").description("With cherry gastrique and seasonal vegetables").price(new BigDecimal("62.00")).imageUrl("https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop").preparationTime(22).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Lamb Chops Provençale").description("Herb-crusted lamb with rosemary jus").price(new BigDecimal("68.00")).imageUrl("https://images.unsplash.com/photo-1586190203519-e21cc028cb29?w=400&h=300&fit=crop").preparationTime(24).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Salmon en Croûte").description("Wild salmon wrapped in puff pastry").price(new BigDecimal("58.00")).imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop").preparationTime(20).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Beef Wellington").description("Tenderloin with mushroom duxelles and pastry").price(new BigDecimal("95.00")).imageUrl("https://images.unsplash.com/photo-1599599810694-b5ac4dd64e66?w=400&h=300&fit=crop").preparationTime(30).category(mainCourse).available(true).build(),
            MenuItem.builder().name("Ossobuco alla Milanese").description("Braised veal shank with saffron risotto").price(new BigDecimal("72.00")).imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop").preparationTime(28).category(mainCourse).available(true).build(),

            // Seafood
            MenuItem.builder().name("Oysters Rockefeller").description("Fresh oysters with spinach and Pernod").price(new BigDecimal("28.00")).imageUrl("https://images.unsplash.com/photo-1615141982883-c7da0e69cb47?w=400&h=300&fit=crop").preparationTime(15).category(seafood).available(false).build(),
            MenuItem.builder().name("Grilled King Crab Legs").description("Alaskan king crab with lemon butter").price(new BigDecimal("78.00")).imageUrl("https://images.unsplash.com/photo-1599599810694-b5ac4dd64e66?w=400&h=300&fit=crop").preparationTime(18).category(seafood).available(true).build(),
            MenuItem.builder().name("Scallops à la Plancha").description("Seared scallops with herb emulsion").price(new BigDecimal("54.00")).imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop").preparationTime(16).category(seafood).available(true).build(),
            MenuItem.builder().name("Lobster Thermidor").description("Classic lobster with brandy sauce").price(new BigDecimal("88.00")).imageUrl("https://images.unsplash.com/photo-1599599810694-b5ac4dd64e66?w=400&h=300&fit=crop").preparationTime(22).category(seafood).available(true).build(),

            // Appetizers
            MenuItem.builder().name("Wagyu Beef Tartare").description("A5 Wagyu with quail egg yolk").price(new BigDecimal("36.00")).imageUrl("https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop").preparationTime(12).category(appetizer).available(true).build(),
            MenuItem.builder().name("Pan-Seared Foie Gras").description("With fig compote and brioche toast").price(new BigDecimal("52.00")).imageUrl("https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop").preparationTime(15).category(appetizer).available(true).build(),
            MenuItem.builder().name("Burrata Salad").description("Fresh burrata with heirloom tomatoes").price(new BigDecimal("22.00")).imageUrl("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop").preparationTime(8).category(appetizer).available(true).build(),
            MenuItem.builder().name("Escargot Bourguignon").description("Snails in garlic and parsley butter").price(new BigDecimal("26.00")).imageUrl("https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop").preparationTime(14).category(appetizer).available(true).build(),
            MenuItem.builder().name("Shrimp Tempura").description("Japanese-style battered shrimp").price(new BigDecimal("18.00")).imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop").preparationTime(10).category(appetizer).available(true).build(),

            // Soups
            MenuItem.builder().name("French Onion Soup").description("Caramelized onions with Gruyère").price(new BigDecimal("14.00")).imageUrl("https://images.unsplash.com/photo-1547592166-7aae4d755744?w=400&h=300&fit=crop").preparationTime(12).category(soup).available(true).build(),
            MenuItem.builder().name("Lobster Bisque").description("Rich and creamy lobster soup").price(new BigDecimal("16.00")).imageUrl("https://images.unsplash.com/photo-1547592166-7aae4d755744?w=400&h=300&fit=crop").preparationTime(14).category(soup).available(true).build(),
            MenuItem.builder().name("Truffle Mushroom Soup").description("Creamy mushroom with truffle oil").price(new BigDecimal("18.00")).imageUrl("https://images.unsplash.com/photo-1547592166-7aae4d755744?w=400&h=300&fit=crop").preparationTime(13).category(soup).available(true).build(),

            // Salads
            MenuItem.builder().name("Caesar Salad Classique").description("Romaine with house-made dressing").price(new BigDecimal("16.00")).imageUrl("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop").preparationTime(8).category(salad).available(true).build(),
            MenuItem.builder().name("Niçoise Salad").description("Tuna, eggs, olives, and anchovy dressing").price(new BigDecimal("22.00")).imageUrl("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop").preparationTime(10).category(salad).available(true).build(),
            MenuItem.builder().name("Arugula Salad").description("Peppery arugula with Parmigiano and balsamic").price(new BigDecimal("18.00")).imageUrl("https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop").preparationTime(7).category(salad).available(true).build(),

            // Desserts
            MenuItem.builder().name("Chocolate Soufflé").description("Dark chocolate with crème anglaise").price(new BigDecimal("24.00")).imageUrl("https://images.unsplash.com/photo-1624492411802-894101cc2956?w=400&h=300&fit=crop").preparationTime(18).category(dessert).available(true).build(),
            MenuItem.builder().name("Crème Brûlée").description("Classic vanilla bean custard").price(new BigDecimal("18.00")).imageUrl("https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop").preparationTime(10).category(dessert).available(true).build(),
            MenuItem.builder().name("Strawberry Pavlova").description("Meringue with fresh berries and cream").price(new BigDecimal("20.00")).imageUrl("https://images.unsplash.com/photo-1624492411802-894101cc2956?w=400&h=300&fit=crop").preparationTime(12).category(dessert).available(true).build(),
            MenuItem.builder().name("Lemon Tart").description("Tangy lemon curd in pastry shell").price(new BigDecimal("16.00")).imageUrl("https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop").preparationTime(8).category(dessert).available(true).build(),
            MenuItem.builder().name("Tiramisu").description("Classic Italian dessert with mascarpone").price(new BigDecimal("14.00")).imageUrl("https://images.unsplash.com/photo-1624492411802-894101cc2956?w=400&h=300&fit=crop").preparationTime(5).category(dessert).available(true).build(),
            MenuItem.builder().name("Panna Cotta").description("Silky Italian cream dessert").price(new BigDecimal("16.00")).imageUrl("https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop").preparationTime(6).category(dessert).available(true).build(),

            // Beverages
            MenuItem.builder().name("Dom Pérignon 2015").description("Prestigious vintage champagne").price(new BigDecimal("450.00")).imageUrl("https://images.unsplash.com/photo-1590485503023-e1757820a4b8?w=400&h=300&fit=crop").preparationTime(2).category(beverage).available(true).build(),
            MenuItem.builder().name("Château Lafite Rothschild 2019").description("Premium Bordeaux wine").price(new BigDecimal("380.00")).imageUrl("https://images.unsplash.com/photo-1590485503023-e1757820a4b8?w=400&h=300&fit=crop").preparationTime(2).category(beverage).available(true).build(),
            MenuItem.builder().name("Espresso Martini").description("Vodka, coffee liqueur, fresh espresso").price(new BigDecimal("16.00")).imageUrl("https://images.unsplash.com/photo-1551632986-6f80e8dd9985?w=400&h=300&fit=crop").preparationTime(5).category(beverage).available(true).build(),
            MenuItem.builder().name("Mojito").description("Rum, mint, lime, soda").price(new BigDecimal("14.00")).imageUrl("https://images.unsplash.com/photo-1551632986-6f80e8dd9985?w=400&h=300&fit=crop").preparationTime(5).category(beverage).available(true).build(),
            MenuItem.builder().name("Single Malt Scotch").description("Premium Scottish whisky").price(new BigDecimal("28.00")).imageUrl("https://images.unsplash.com/photo-1590485503023-e1757820a4b8?w=400&h=300&fit=crop").preparationTime(2).category(beverage).available(true).build(),
            MenuItem.builder().name("Cappuccino").description("Espresso with steamed milk").price(new BigDecimal("6.00")).imageUrl("https://images.unsplash.com/photo-1578432556433-bc8b3d8214c1?w=400&h=300&fit=crop").preparationTime(4).category(beverage).available(true).build()
        ));
        log.info("Created/Updated 7 categories and 32 menu items");
    }

    private void seedTables() {
        // 6. Create Tables - Fixed layout with Floor 1, Floor 2, and VIP tables
        // FLOOR 1 - Main Dining Area (12 tables)
        tableRepo.saveAll(List.of(
            // Window side tables (2-person)
            Table.builder().name("F1-01").capacity(2).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Window").positionX(50.0).positionY(50.0).build(),
            Table.builder().name("F1-02").capacity(2).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Window").positionX(50.0).positionY(150.0).build(),
            Table.builder().name("F1-03").capacity(2).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Window").positionX(50.0).positionY(250.0).build(),
            Table.builder().name("F1-04").capacity(2).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Window").positionX(50.0).positionY(350.0).build(),

            // Center area tables (4-person)
            Table.builder().name("F1-05").capacity(4).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Center").positionX(200.0).positionY(80.0).build(),
            Table.builder().name("F1-06").capacity(4).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Center").positionX(200.0).positionY(220.0).build(),
            Table.builder().name("F1-07").capacity(4).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Center").positionX(350.0).positionY(80.0).build(),
            Table.builder().name("F1-08").capacity(4).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Center").positionX(350.0).positionY(220.0).build(),

            // Large tables (6-8 person)
            Table.builder().name("F1-09").capacity(6).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Center").positionX(520.0).positionY(100.0).build(),
            Table.builder().name("F1-10").capacity(6).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Center").positionX(520.0).positionY(250.0).build(),

            // Corner tables
            Table.builder().name("F1-11").capacity(4).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Corner").positionX(680.0).positionY(50.0).build(),
            Table.builder().name("F1-12").capacity(4).status(TableStatus.AVAILABLE).floor(1).type(TableType.NORMAL).zone("Corner").positionX(680.0).positionY(350.0).build()
        ));

        // FLOOR 2 - Additional Seating (10 tables)
        tableRepo.saveAll(List.of(
            // Balcony tables (2-person)
            Table.builder().name("F2-01").capacity(2).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Balcony").positionX(50.0).positionY(50.0).build(),
            Table.builder().name("F2-02").capacity(2).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Balcony").positionX(50.0).positionY(150.0).build(),
            Table.builder().name("F2-03").capacity(2).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Balcony").positionX(50.0).positionY(250.0).build(),

            // Main area (4-person)
            Table.builder().name("F2-04").capacity(4).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Main").positionX(200.0).positionY(80.0).build(),
            Table.builder().name("F2-05").capacity(4).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Main").positionX(200.0).positionY(220.0).build(),
            Table.builder().name("F2-06").capacity(4).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Main").positionX(350.0).positionY(80.0).build(),
            Table.builder().name("F2-07").capacity(4).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Main").positionX(350.0).positionY(220.0).build(),

            // Large tables
            Table.builder().name("F2-08").capacity(6).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Main").positionX(520.0).positionY(100.0).build(),
            Table.builder().name("F2-09").capacity(8).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Main").positionX(520.0).positionY(280.0).build(),
            Table.builder().name("F2-10").capacity(4).status(TableStatus.AVAILABLE).floor(2).type(TableType.NORMAL).zone("Corner").positionX(680.0).positionY(150.0).build()
        ));

        // VIP TABLES - Private Dining (3 tables)
        tableRepo.saveAll(List.of(
            Table.builder().name("VIP-01").capacity(8).status(TableStatus.AVAILABLE).floor(1).type(TableType.VIP).zone("Private").positionX(200.0).positionY(150.0).build(),
            Table.builder().name("VIP-02").capacity(10).status(TableStatus.AVAILABLE).floor(1).type(TableType.VIP).zone("Private").positionX(450.0).positionY(150.0).build(),
            Table.builder().name("VIP-03").capacity(12).status(TableStatus.AVAILABLE).floor(1).type(TableType.VIP).zone("Private").positionX(325.0).positionY(300.0).build()
        ));

        log.info("Created 25 fixed tables (12 on Floor 1, 10 on Floor 2, 3 VIP tables)");

        log.info("========== DATABASE SEEDED SUCCESSFULLY ==========");
    }
}
