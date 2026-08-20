package com.smarttravel.review.converter;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

class TagsConverterTest {

    private final TagsConverter converter = new TagsConverter();

    @Test
    void convertToDatabaseColumn_withTags_returnsJsonString() {
        List<String> tags = List.of("Sach se", "View dep");
        String result = converter.convertToDatabaseColumn(tags);
        assertThat(result).isEqualTo("[\"Sach se\",\"View dep\"]");
    }

    @Test
    void convertToDatabaseColumn_withNull_returnsNull() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    void convertToDatabaseColumn_withEmpty_returnsNull() {
        assertThat(converter.convertToDatabaseColumn(List.of())).isNull();
    }

    @Test
    void convertToEntityAttribute_withValidJson_returnsList() {
        String json = "[\"Sach se\",\"View dep\"]";
        List<String> result = converter.convertToEntityAttribute(json);
        assertThat(result).containsExactly("Sach se", "View dep");
    }

    @Test
    void convertToEntityAttribute_withNull_returnsEmptyList() {
        assertThat(converter.convertToEntityAttribute(null)).isEmpty();
    }

    @Test
    void convertToEntityAttribute_withBlank_returnsEmptyList() {
        assertThat(converter.convertToEntityAttribute("  ")).isEmpty();
    }

    @Test
    void roundTrip_preservesData() {
        List<String> original = List.of("An toan", "De di", "Co bong mat");
        String encoded = converter.convertToDatabaseColumn(original);
        List<String> decoded = converter.convertToEntityAttribute(encoded);
        assertThat(decoded).isEqualTo(original);
    }
}
