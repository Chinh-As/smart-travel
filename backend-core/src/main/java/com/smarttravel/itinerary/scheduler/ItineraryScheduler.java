package com.smarttravel.itinerary.scheduler;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.smarttravel.itinerary.dto.request.TimeSlotRequest;
import com.smarttravel.itinerary.dto.response.ItineraryGenerateResponse;
import com.smarttravel.itinerary.dto.response.ItineraryItemResponse;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.mapper.PlaceMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ItineraryScheduler {

    private static final LocalTime DEFAULT_OPEN_TIME = LocalTime.of(8, 0);
    private static final LocalTime DEFAULT_CLOSE_TIME = LocalTime.of(22, 0);

    private final PlaceMapper placeMapper;

    public ItineraryGenerateResponse schedule(
        LocalDate date,
        List<TimeSlotRequest> slots,
        List<Place> candidates,
        int visitDurationMinutes,
        int bufferMinutes,
        int maxPlaces
    ) {
        Set<UUID> usedPlaceIds = new HashSet<>();
        List<ItineraryItemResponse> items = new ArrayList<>();

        for (TimeSlotRequest slot : slots) {
            LocalTime currentTime = slot.getStartTime();

            while (items.size() < maxPlaces
                && canFit(currentTime, slot.getEndTime(), visitDurationMinutes)) {
                
                LocalTime visitStart = currentTime;
                LocalTime visitEnd = currentTime.plusMinutes(visitDurationMinutes);

                Place selectedPlace = findNextAvailablePlace(
                    candidates,
                    usedPlaceIds,
                    date, 
                    visitStart, 
                    visitEnd
                );

                if (selectedPlace == null) {
                    break;
                }

                items.add(ItineraryItemResponse.builder()
                        .placeId(selectedPlace.getId())
                        .placeName(selectedPlace.getName())
                        .place(placeMapper.toResponse(selectedPlace, null, null))
                        .startTime(visitStart)
                        .endTime(visitEnd)
                        .build());
                        
                usedPlaceIds.add(selectedPlace.getId());

                currentTime = visitEnd.plusMinutes(bufferMinutes);
            }

            if (items.size() >= maxPlaces) {
                break;
            }
        }

        List<UUID> unscheduledPlaceIds = candidates.stream()
            .map(Place::getId)
            .filter(placeId -> !usedPlaceIds.contains(placeId))
            .toList();

        return ItineraryGenerateResponse.builder()
                .date(date)
                .items(items)
                .unscheduledPlaceIds(unscheduledPlaceIds)
                .build();
    }

    private Place findNextAvailablePlace(
        List<Place> candidates,
        Set<UUID> usedPlaceIds,
        LocalDate date,
        LocalTime visitStart,
        LocalTime visitEnd
    ) {
        for (Place place : candidates) {
            if (usedPlaceIds.contains(place.getId())) {
                continue;
            }

            if (!isOpenForVisit(place, date, visitStart, visitEnd)) {
                continue;
            }

            return place;
        }

        return null;
    }


    private boolean canFit(
        LocalTime startTime,
        LocalTime slotEndTime,
        int visitDurationMinutes
    ) {
        LocalTime endTime = startTime.plusMinutes(visitDurationMinutes);
        return !endTime.isAfter(slotEndTime);
    }

    private boolean isOpenForVisit(
        Place place,
        LocalDate date,
        LocalTime visitStart,
        LocalTime visitEnd
    ) {
        return !visitStart.isBefore(DEFAULT_OPEN_TIME)
                && !visitEnd.isAfter(DEFAULT_CLOSE_TIME);
    }
}
