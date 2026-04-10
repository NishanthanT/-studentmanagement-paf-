package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserId(Long userId);
    
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Ticket> findByTechnicianId(Long technicianId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByResourceId(Long resourceId);

    @Query("SELECT t FROM Ticket t WHERE " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.user.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.user.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Ticket> searchTickets(String query);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:technicianId IS NULL OR t.technician.id = :technicianId) AND " +
           "(:userEmail IS NULL OR LOWER(t.user.email) LIKE LOWER(CONCAT('%', :userEmail, '%'))) AND " +
           "(:userName IS NULL OR LOWER(t.user.fullName) LIKE LOWER(CONCAT('%', :userName, '%'))) AND " +
           "(:category IS NULL OR LOWER(t.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:resourceId IS NULL OR t.resource.id = :resourceId) AND " +
           "(:date IS NULL OR CAST(t.createdAt AS date) = :date)")
    List<Ticket> filterTickets(TicketStatus status, TicketPriority priority, 
                              Long technicianId, String userEmail, String userName,
                              String category, Long resourceId, LocalDate date);

    long countByStatus(TicketStatus status);

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countTicketsByPriority();

    long countByTechnicianIdAndStatus(Long technicianId, TicketStatus status);

    long countByTechnicianId(Long technicianId);
}
