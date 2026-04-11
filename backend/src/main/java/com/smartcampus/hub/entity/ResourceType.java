package com.smartcampus.hub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "resource_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    @ElementCollection
    @CollectionTable(name = "resource_type_locations", joinColumns = @JoinColumn(name = "resource_type_id"))
    @Column(name = "location")
    private List<String> locations;
}
