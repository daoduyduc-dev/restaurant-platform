package com.restaurant.platform.modules.loyalty.mapper;

import com.restaurant.platform.modules.loyalty.dto.LoyaltyResponse;
import com.restaurant.platform.modules.loyalty.dto.LoyaltyTransactionResponse;
import com.restaurant.platform.modules.loyalty.entity.LoyaltyAccount;
import com.restaurant.platform.modules.loyalty.entity.LoyaltyTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface LoyaltyMapper {

    LoyaltyResponse toResponse(LoyaltyAccount account);

    LoyaltyTransactionResponse toResponse(LoyaltyTransaction transaction);
}
