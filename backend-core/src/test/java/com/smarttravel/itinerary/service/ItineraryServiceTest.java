package com.smarttravel.itinerary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.itinerary.dto.request.ItinerarySaveRequest;
import com.smarttravel.itinerary.entity.Itinerary;
import com.smarttravel.itinerary.repository.ItineraryDayRepository;
import com.smarttravel.itinerary.repository.ItineraryItemRepository;
import com.smarttravel.itinerary.repository.ItineraryRepository;
import com.smarttravel.itinerary.scheduler.ItineraryScheduler;
import com.smarttravel.place.mapper.PlaceMapper;
import com.smarttravel.place.repository.PlaceRepository;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ItineraryServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ITINERARY_ID = UUID.randomUUID();

    @Mock private PlaceRepository placeRepository;
    @Mock private ItineraryScheduler itineraryScheduler;
    @Mock private ItineraryRepository itineraryRepository;
    @Mock private ItineraryDayRepository itineraryDayRepository;
    @Mock private ItineraryItemRepository itineraryItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private PlaceMapper placeMapper;

    @InjectMocks private ItineraryService itineraryService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(USER_ID).email("user@example.com").name("Test User").build();
    }

    @Test
    void saveItinerary_createsNewItinerary() {
        when(userRepository.getReferenceById(USER_ID)).thenReturn(owner);
        when(itineraryRepository.save(any(Itinerary.class))).thenAnswer(invocation -> {
            Itinerary itinerary = invocation.getArgument(0);
            if (itinerary.getId() == null) {
                itinerary.setId(ITINERARY_ID);
            }
            return itinerary;
        });

        var response = itineraryService.saveItinerary(USER_ID, request(null));

        assertThat(response.getId()).isEqualTo(ITINERARY_ID);
        assertThat(response.getTitle()).isEqualTo("Weekend in HCMC");
        verify(itineraryDayRepository).deleteByItineraryId(ITINERARY_ID);
    }

    @Test
    void saveItinerary_withExistingId_requiresPutEndpoint() {
        assertThatThrownBy(() -> itineraryService.saveItinerary(USER_ID, request(ITINERARY_ID)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Use PUT");
    }

    @Test
    void updateItinerary_withDifferentBodyId_rejectsRequest() {
        assertThatThrownBy(() -> itineraryService.updateItinerary(USER_ID, ITINERARY_ID, request(UUID.randomUUID())))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must match the path");
    }

    @Test
    void updateItinerary_ownedItinerary_updatesIt() {
        Itinerary itinerary = existingItinerary(owner);
        when(itineraryRepository.findById(ITINERARY_ID)).thenReturn(Optional.of(itinerary));
        when(itineraryRepository.save(any(Itinerary.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = itineraryService.updateItinerary(USER_ID, ITINERARY_ID, request(null));

        assertThat(response.getId()).isEqualTo(ITINERARY_ID);
        assertThat(response.getTitle()).isEqualTo("Weekend in HCMC");
        verify(itineraryDayRepository).deleteByItineraryId(ITINERARY_ID);
    }

    @Test
    void updateItinerary_ownedByAnotherUser_rejectsRequest() {
        User anotherUser = User.builder().id(UUID.randomUUID()).email("other@example.com").name("Other User").build();
        when(itineraryRepository.findById(ITINERARY_ID)).thenReturn(Optional.of(existingItinerary(anotherUser)));

        assertThatThrownBy(() -> itineraryService.updateItinerary(USER_ID, ITINERARY_ID, request(null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("do not own");
    }

    @Test
    void deleteItinerary_ownedItinerary_setsDeletedAt() {
        Itinerary itinerary = existingItinerary(owner);
        when(itineraryRepository.findById(ITINERARY_ID)).thenReturn(Optional.of(itinerary));

        itineraryService.deleteItinerary(USER_ID, ITINERARY_ID);

        ArgumentCaptor<Itinerary> captor = ArgumentCaptor.forClass(Itinerary.class);
        verify(itineraryRepository).save(captor.capture());
        assertThat(captor.getValue().getDeletedAt()).isNotNull();
    }

    private ItinerarySaveRequest request(UUID id) {
        return new ItinerarySaveRequest(id, "Weekend in HCMC", List.of());
    }

    private Itinerary existingItinerary(User user) {
        Itinerary itinerary = new Itinerary();
        itinerary.setId(ITINERARY_ID);
        itinerary.setUser(user);
        itinerary.setTitle("Old title");
        itinerary.setCreatedAt(OffsetDateTime.now());
        return itinerary;
    }
}
