package com.restaurant.platform.modules.table.repository;

import com.restaurant.platform.modules.table.entity.Table;
import com.restaurant.platform.modules.table.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TableRepository extends JpaRepository<Table, UUID>{

    boolean existsByName(String name);

    Optional<Table> findByName(String tableName);

    Optional<Table> findById(UUID id);

    Long countByStatus(TableStatus status);
    
    List<Table> findByStatusIn(List<TableStatus> statuses);

    List<Table> findByFloor(Integer floor);
    
    List<Table> findAllByOrderByFloorAsc();
    
    long count();

}
