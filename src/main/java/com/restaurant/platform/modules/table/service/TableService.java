package com.restaurant.platform.modules.table.service;

import com.restaurant.platform.modules.table.dto.TableRequest;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.enums.TableType;

import java.util.List;
import java.util.UUID;

public interface TableService {

    TableResponse create(TableRequest tableRequest);

    TableResponse getTableById(UUID tableId);

    TableResponse getTableByName(String tableName);

    List<TableResponse> getAllTables();

    List<TableResponse> searchTables(List<TableStatus> statuses, Integer floor, TableType type);
    
    List<Integer> getAvailableFloors();

    TableResponse update(UUID id, TableRequest tableRequest);

    void delete(UUID tableId);

    TableResponse updateStatus(UUID tableId, TableStatus status);
}
