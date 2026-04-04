package com.restaurant.platform.modules.table.service;

import com.restaurant.platform.common.constant.ErrorCode;
import com.restaurant.platform.common.exception.BadRequestException;
import com.restaurant.platform.modules.table.dto.TableRequest;
import com.restaurant.platform.modules.table.dto.TableResponse;
import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
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
        return tableRepository.findAll()
                .stream()
                .map(tableMapper::toResponse)
                .toList();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByStatus(List<TableStatus> statuses) {
        return tableRepository.findByStatusIn(statuses)
                .stream()
                .map(tableMapper::toResponse)
                .toList();
    }

    @Override
    public TableResponse update(UUID id, TableRequest tableRequest) {
        Table table = getTableOrThrow(id);

        tableMapper.updateEntity(table, tableRequest);

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
}
