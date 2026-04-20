package com.restaurant.platform.modules.table.service;

import com.restaurant.platform.modules.table.dto.TableRequest;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

public interface TableService {

    TableResponse create(TableRequest tableRequest);

    TableResponse getTableById(UUID tableId);

    TableResponse getTableByName(String tableName);

    List<TableResponse> getAllTables();
    
    List<TableResponse> getTablesByStatus(List<TableStatus> statuses);

    List<TableResponse> getTablesByFloor(Integer floor);
    
    List<Integer> getAvailableFloors();

    TableResponse update(UUID id, TableRequest tableRequest);

    void delete(UUID tableId);

    TableResponse updateStatus(UUID tableId, TableStatus status);
}
