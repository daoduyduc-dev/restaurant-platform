package com.restaurant.platform.modules.table.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.modules.table.dto.TableRequest;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import com.restaurant.platform.modules.table.enums.TableType;
import com.restaurant.platform.modules.table.mapper.TableMapper;
import com.restaurant.platform.modules.table.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;
    private final TableMapper tableMapper;

    private Table getTableOrThrow(UUID id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.TABLE_NOT_FOUND,
                        "Table not found id: " + id
                ));
    }

    @Override
    public TableResponse create(TableRequest tableRequest) {

        if(tableRepository.existsByName(tableRequest.getName())){
            throw new BadRequestException(
                    ErrorCode.TABLE_ALREADY_EXISTS,
                    "Name already exists: " +  tableRequest.getName()
            );
        }

        Table table = tableMapper.toEntity(tableRequest);
        table.setStatus(TableStatus.AVAILABLE);
        table.setType(resolveType(tableRequest.getType(), null));
        tableRepository.save(table);

        return tableMapper.toResponse(table);
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(UUID tableId) {

        return tableMapper.toResponse(getTableOrThrow(tableId));
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableByName(String tableName) {

        return tableMapper.toResponse(
                tableRepository.findByName(tableName)
                .orElseThrow(() -> new BadRequestException(
                        ErrorCode.TABLE_NOT_FOUND,
                        "Table not found name: " + tableName
                ))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAllByOrderByFloorAscNameAsc()
                .stream()
                .map(tableMapper::toResponse)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> searchTables(List<TableStatus> statuses, Integer floor, TableType type) {
        return tableRepository.findAllByOrderByFloorAscNameAsc()
                .stream()
                .filter(table -> statuses == null || statuses.isEmpty() || statuses.contains(table.getStatus()))
                .filter(table -> floor == null || floor.equals(table.getFloor()))
                .filter(table -> type == null || type == table.getType())
                .map(tableMapper::toResponse)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Integer> getAvailableFloors() {
        return tableRepository.findAllByOrderByFloorAscNameAsc()
                .stream()
                .map(Table::getFloor)
                .filter(f -> f != null)
                .distinct()
                .sorted()
                .toList();
    }

    @Override
    public TableResponse update(UUID id, TableRequest tableRequest) {
        Table table = getTableOrThrow(id);
        TableType currentType = table.getType();

        tableMapper.updateEntity(table, tableRequest);
        table.setType(resolveType(tableRequest.getType(), currentType));

        tableRepository.save(table);

        return tableMapper.toResponse(table);
    }

    @Override
    public void delete(UUID tableId) {
        Table table = getTableOrThrow(tableId);

        tableRepository.delete(table);
    }

    @Override
    public TableResponse updateStatus(UUID tableId, TableStatus status) {
        Table  table = getTableOrThrow(tableId);
        table.setStatus(status);
        tableRepository.save(table);
        return tableMapper.toResponse(table);
    }

    private TableType resolveType(TableType requestedType, TableType currentType) {
        if (requestedType != null) {
            return requestedType;
        }
        if (currentType != null) {
            return currentType;
        }
        return TableType.NORMAL;
    }
}
