package com.restaurant.platform.modules.table.dto;

import com.restaurant.platform.modules.table.enums.TableStatus;
import lombok.Data;

@Data
public class UpdateTableStatusRequest {
    private TableStatus status;
}