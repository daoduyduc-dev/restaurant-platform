package com.restaurant.platform.modules.notification;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface NotificationMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "createdAt", source = "createdDate")
    @Mapping(target = "updatedAt", source = "modifiedDate")
    NotificationResponseDTO toDTO(NotificationEntity notification);

    List<NotificationResponseDTO> toDTOList(List<NotificationEntity> notifications);

    @Mapping(target = "user.id", source = "userId")
    NotificationEntity toEntity(NotificationRequestDTO requestDTO);
}
