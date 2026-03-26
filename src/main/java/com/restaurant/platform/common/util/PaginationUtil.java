package com.restaurant.platform.common.util;

import com.restaurant.platform.common.constant.AppConstants;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public final class PaginationUtil {

    private PaginationUtil() {}

    public static Pageable createPageable(Integer page, Integer size) {

        int pageNumber = (page == null || page < 0)
                ? AppConstants.DEFAULT_PAGE
                : page;

        int pageSize = (size == null || size <= 0)
                ? AppConstants.DEFAULT_SIZE
                : Math.min(size, AppConstants.MAX_PAGE_SIZE);

        return PageRequest.of(pageNumber, pageSize);
    }
}
