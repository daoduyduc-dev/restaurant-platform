package com.restaurant.platform.modules.table.controller;

import com.restaurant.platform.common.response.ApiResponse;
import com.restaurant.platform.modules.table.dto.TableRequest;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.dto.UpdateTableStatusRequest;
import com.restaurant.platform.modules.table.service.TableService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('TABLE_CREATE')")
    public ApiResponse<TableResponse> create(@Valid @RequestBody TableRequest request) {
        return ApiResponse.success("Table created successfully",
                tableService.create(request));
    }

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<TableResponse>> getAll(
            @RequestParam(required = false) List<com.restaurant.platform.modules.table.enums.TableStatus> status
    ) {
        if (status != null && !status.isEmpty()) {
            return ApiResponse.success(tableService.getTablesByStatus(status));
        }
        return ApiResponse.success(tableService.getAllTables());
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','WAITER','MANAGER','RECEPTIONIST')")
    public ApiResponse<TableResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(tableService.getTableById(id));
    }

    // ================= GET BY NAME =================
    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('ADMIN','WAITER','MANAGER','RECEPTIONIST')")
    public ApiResponse<TableResponse> getByName(@PathVariable String name) {
        return ApiResponse.success(tableService.getTableByName(name));
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TableResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody TableRequest request
    ) {
        return ApiResponse.success("Table updated successfully",
                tableService.update(id, request));
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        tableService.delete(id);
        return ApiResponse.successMessage("Table deleted successfully");
    }

    // ================= UPDATE STATUS =================
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('WAITER','MANAGER') and hasAuthority('TABLE_UPDATE_STATUS')")
    public ApiResponse<TableResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateTableStatusRequest request
    ) {
        return ApiResponse.success("Table status updated",
                tableService.updateStatus(id, request.getStatus()));
    }
}