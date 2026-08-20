package com.smarttravel.itinerary.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.itinerary.dto.request.ItineraryGenerateRequest;
import com.smarttravel.itinerary.dto.request.TimeSlotRequest;
import com.smarttravel.itinerary.dto.response.ItineraryGenerateResponse;
import com.smarttravel.itinerary.scheduler.ItineraryScheduler;
import com.smarttravel.place.entity.Place;
import com.smarttravel.place.repository.PlaceRepository;

import com.smarttravel.common.exception.ResourceNotFoundException;
import com.smarttravel.itinerary.dto.request.ItinerarySaveRequest;
import com.smarttravel.itinerary.dto.request.ItineraryItemSaveRequest;
import com.smarttravel.itinerary.dto.response.ItineraryResponse;
import com.smarttravel.itinerary.dto.response.ItineraryDayResponse;
import com.smarttravel.itinerary.dto.response.ItineraryItemResponse;
import com.smarttravel.itinerary.entity.Itinerary;
import com.smarttravel.itinerary.entity.ItineraryDay;
import com.smarttravel.itinerary.entity.ItineraryItem;
import com.smarttravel.itinerary.repository.ItineraryRepository;
import com.smarttravel.itinerary.repository.ItineraryDayRepository;
import com.smarttravel.itinerary.repository.ItineraryItemRepository;
import com.smarttravel.user.repository.UserRepository;
import com.smarttravel.place.mapper.PlaceMapper;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private static final int DEFAULT_VISIT_DURATION_MINUTES = 90;
    private static final int DEFAULT_BUFFER_MINUTES = 15;
    private static final int DEFAULT_MAX_PLACES = 5;

    private final PlaceRepository placeRepository;
    private final ItineraryScheduler itineraryScheduler;
    private final ItineraryRepository itineraryRepository;
    private final ItineraryDayRepository itineraryDayRepository;
    private final ItineraryItemRepository itineraryItemRepository;
    private final UserRepository userRepository;
    private final PlaceMapper placeMapper;

    @Transactional(readOnly = true)
    public ItineraryGenerateResponse generate(ItineraryGenerateRequest request) {
        validateSlots(request.getSlots());

        int visitDurationMinutes = defaultIfNull(
            request.getVisitDurationMinutes(),
            DEFAULT_VISIT_DURATION_MINUTES
        );

        int bufferMinutes = defaultIfNull(
            request.getBufferMinutes(),
            DEFAULT_BUFFER_MINUTES);

        int maxPlaces = defaultIfNull(
            request.getMaxPlaces(),
            DEFAULT_MAX_PLACES
        );

        List<Place> places = placeRepository.findAllById(request.getCandidatePlaceIds());

        Map<UUID, Place> placeById = places.stream()
            .collect(Collectors.toMap(Place::getId, place -> place));

        List<Place> candidates = request.getCandidatePlaceIds().stream()
            .map(placeById::get)
            .filter(Objects::nonNull)
            .toList();

        if (candidates.isEmpty()) {
            throw new BadRequestException("No valid candidate places found");
        }

        return itineraryScheduler.schedule(
            request.getDate(),
            request.getSlots(),
            candidates,
            visitDurationMinutes,
            bufferMinutes,
            maxPlaces
        );
    }

    private void validateSlots(List<TimeSlotRequest> slots) {
        for (TimeSlotRequest slot : slots) {
            if (!slot.getStartTime().isBefore(slot.getEndTime())) {
                throw new BadRequestException("Slot startTime must be before endTime");
            }
        }
    }

    private int defaultIfNull(Integer value, int defaultValue) {
        return value != null ? value : defaultValue;
    }

    @Transactional(readOnly = true)
    public List<ItineraryResponse> getUserItineraries(UUID userId) {
        List<Itinerary> itineraries = itineraryRepository.findAllByUserIdAndDeletedAtIsNull(userId);
        return itineraries.stream()
                .map(this::toItineraryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ItineraryResponse saveItinerary(UUID userId, ItinerarySaveRequest request) {
        if (request.id() != null) {
            throw new BadRequestException("Use PUT /api/v1/itineraries/{id} to update an itinerary");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(userRepository.getReferenceById(userId));
        itinerary.setCreatedAt(OffsetDateTime.now());
        itinerary.setStatus("DRAFT");
        return persistItinerary(itinerary, request);
    }

    @Transactional
    public ItineraryResponse updateItinerary(UUID userId, UUID itineraryId, ItinerarySaveRequest request) {
        if (request.id() != null && !request.id().equals(itineraryId)) {
            throw new BadRequestException("Itinerary ID in the request body must match the path");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .filter(savedItinerary -> savedItinerary.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found"));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this itinerary");
        }

        return persistItinerary(itinerary, request);
    }

    private ItineraryResponse persistItinerary(Itinerary itinerary, ItinerarySaveRequest request) {

        itinerary.setTitle(request.title() != null ? request.title() : "Lịch trình của tôi");
        itinerary.setStartDate(LocalDate.now());
        itinerary.setEndDate(LocalDate.now());
        itinerary.setUpdatedAt(OffsetDateTime.now());
        itinerary = itineraryRepository.save(itinerary);

        itineraryDayRepository.deleteByItineraryId(itinerary.getId());
        itineraryDayRepository.flush();

        Map<Integer, List<ItineraryItemSaveRequest>> itemsByDay = request.items().stream()
                .collect(Collectors.groupingBy(ItineraryItemSaveRequest::dayIndex));

        List<ItineraryDay> savedDays = new ArrayList<>();
        LocalDate startDate = itinerary.getStartDate();

        for (Map.Entry<Integer, List<ItineraryItemSaveRequest>> entry : itemsByDay.entrySet()) {
            int dayIndex = entry.getKey();
            List<ItineraryItemSaveRequest> itemRequests = entry.getValue();

            ItineraryDay day = new ItineraryDay();
            day.setItinerary(itinerary);
            day.setDayIndex(dayIndex);
            day.setTripDate(startDate.plusDays(dayIndex - 1));
            day = itineraryDayRepository.save(day);

            List<ItineraryItem> savedItems = new ArrayList<>();
            itemRequests.sort(Comparator.comparing(ItineraryItemSaveRequest::startTime));

            for (int i = 0; i < itemRequests.size(); i++) {
                ItineraryItemSaveRequest itemReq = itemRequests.get(i);
                ItineraryItem item = new ItineraryItem();
                item.setItineraryDay(day);
                item.setPlace(placeRepository.getReferenceById(itemReq.placeId()));
                item.setStartTime(LocalTime.parse(itemReq.startTime()));
                item.setEndTime(LocalTime.parse(itemReq.endTime()));
                item.setOrderIndex(i);
                item.setNote(itemReq.note());
                savedItems.add(itineraryItemRepository.save(item));
            }
            day.setItems(savedItems);
            savedDays.add(day);
        }
        itinerary.setDays(savedDays);

        int maxDayIndex = itemsByDay.keySet().stream().mapToInt(Integer::intValue).max().orElse(1);
        itinerary.setEndDate(startDate.plusDays(maxDayIndex - 1));
        itinerary = itineraryRepository.save(itinerary);

        return toItineraryResponse(itinerary);
    }

    @Transactional
    public void deleteItinerary(UUID userId, UUID itineraryId) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found"));
        if (!itinerary.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this itinerary");
        }
        itinerary.setDeletedAt(OffsetDateTime.now());
        itineraryRepository.save(itinerary);
    }

    private ItineraryResponse toItineraryResponse(Itinerary i) {
        List<ItineraryDayResponse> dayResponses = new ArrayList<>();
        if (i.getDays() != null) {
            List<ItineraryDay> sortedDays = i.getDays().stream()
                    .sorted(Comparator.comparing(ItineraryDay::getDayIndex))
                    .toList();

            for (ItineraryDay day : sortedDays) {
                List<ItineraryItemResponse> itemResponses = new ArrayList<>();
                if (day.getItems() != null) {
                    List<ItineraryItem> sortedItems = day.getItems().stream()
                            .sorted(Comparator.comparing(ItineraryItem::getOrderIndex))
                            .toList();

                    for (ItineraryItem item : sortedItems) {
                        itemResponses.add(ItineraryItemResponse.builder()
                                .id(item.getId())
                                .placeId(item.getPlace() != null ? item.getPlace().getId() : null)
                                .placeName(item.getPlace() != null ? item.getPlace().getName() : "Không rõ")
                                .place(item.getPlace() != null ? placeMapper.toResponse(item.getPlace(), null, null) : null)
                                .startTime(item.getStartTime())
                                .endTime(item.getEndTime())
                                .orderIndex(item.getOrderIndex())
                                .note(item.getNote())
                                .timeSlot(determineTimeSlot(item.getStartTime()))
                                .build());
                    }
                }
                dayResponses.add(ItineraryDayResponse.builder()
                        .id(day.getId())
                        .tripDate(day.getTripDate())
                        .dayIndex(day.getDayIndex())
                        .items(itemResponses)
                        .build());
            }
        }
        return ItineraryResponse.builder()
                .id(i.getId())
                .title(i.getTitle())
                .startDate(i.getStartDate())
                .endDate(i.getEndDate())
                .status(i.getStatus())
                .createdAt(i.getCreatedAt())
                .days(dayResponses)
                .build();
    }

    private String determineTimeSlot(LocalTime time) {
        if (time == null) return "MORNING";
        int hour = time.getHour();
        if (hour >= 5 && hour < 11) return "MORNING";
        if (hour >= 11 && hour < 13) return "NOON";
        if (hour >= 13 && hour < 17) return "AFTERNOON";
        return "EVENING";
    }
}
